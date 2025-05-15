import { useState, useEffect } from 'preact/hooks';
import dayjs from 'dayjs';
import 'dayjs/locale/ja';

dayjs.locale('ja');

export default function ActivityForm() {
  // フィールド state
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [startTime, setStartTime] = useState('12:00');
  const [endTime, setEndTime] = useState('12:00');

  const [deleteKey, setDeleteKey] = useState('');
  const [agree, setAgree] = useState(false);
  const [activities, setActivities] = useState([]);
  const [photo, setPhoto] = useState(null);

  // locations 配列 state + ハンドラ
  const [locations, setLocations] = useState(['']);
  const addLocation = () => {
    if (locations.length >= 5) return;
    setLocations([...locations, '']);
  };
  const removeLocation = (idx) => {
    if (locations.length <= 1) return;
    setLocations(locations.filter((_, i) => i !== idx));
  };
  const updateLocation = (idx, value) => {
    const newLocs = [...locations];
    newLocs[idx] = value;
    setLocations(newLocs);
  };

  // Meta state
  const [browserId, setBrowserId] = useState('');
  const [ip, setIp] = useState('');
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // on mount: browserId & IP & load saved times
  useEffect(() => {
    try {
      let id = localStorage.getItem('browserId');
      if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem('browserId', id);
      }
      setBrowserId(id);
    } catch {
      setBrowserId('');
    }
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setIp(data.ip || ''))
      .catch(() => setIp(''));

    const savedKey = localStorage.getItem('deleteKey');
    const savedStart = localStorage.getItem('startTime');
    const savedEnd = localStorage.getItem('endTime');
    if (savedKey) setDeleteKey(savedKey);
    if (savedStart) setStartTime(savedStart);
    if (savedEnd) setEndTime(savedEnd);
  }, []);

  const handleCheckboxChange = (e) => {
    const val = e.target.value;
    setActivities(prev =>
      e.target.checked ? [...prev, val] : prev.filter(x => x !== val)
    );
  };

  const generateDateOptions = () => {
    const days = [];
    for (let i = 0; i <= 30; i++) {
      const d = dayjs().subtract(i, 'day');
      days.push(
        <option key={d.format('YYYY-MM-DD')} value={d.format('YYYY-MM-DD')}>
          {d.format('YYYY年M月D日（ddd）')}
        </option>
      );
    }
    return days;
  };

  const generateTimeOptions = () => {
    const opts = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        const val = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        opts.push(<option key={val} value={val}>{val}</option>);
      }
    }
    return opts;
  };

  const normalizeLatLon = (input) => {
    const cleaned = input
      .replace(/[()\s°NnEeSsWw]/g, '')
      .replace(/['"]/g, '')
      .trim();
    const parts = cleaned.split(',').map(p => parseFloat(p)).filter(n => !isNaN(n));
    if (parts.length !== 2) return null;
    const [a, b] = parts;
    const lat = Math.abs(a) <= 90 ? a : (Math.abs(b) <= 90 ? b : null);
    const lon = lat === a ? b : a;
    if (lat === null || Math.abs(lon) > 180) return null;
    return `${lat.toFixed(6)},${lon.toFixed(6)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const newErrors = {};
    if (!browserId) newErrors.browserId = 'ブラウザIDの取得に失敗しました。';
    if (!title.trim()) newErrors.title = 'タイトルは必須です';
    if (!date) newErrors.date = '開催日は必須です';

    const normalizedLocations = locations
      .map(loc => normalizeLatLon(loc))
      .filter(n => n !== null);
    if (normalizedLocations.length < 1) {
      newErrors.locations = '緯度・経度を最低１つ正しい形式で入力してください';
    }

    if (!deleteKey.trim()) newErrors.deleteKey = '削除キーは必須です';
    if (!agree) newErrors.agree = '同意チェックは必須です';
    if (activities.length === 0) newErrors.activities = '実施した活動を最低1つ選択してください';
    if (startTime && endTime && startTime > endTime) newErrors.time = '開始時刻は終了時刻より前である必要があります';
    if (photo && photo.size > 5 * 1024 * 1024) newErrors.photo = '写真のサイズは5MB以下にしてください';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    setErrors({});
    localStorage.setItem('deleteKey', deleteKey);
    localStorage.setItem('startTime', startTime);
    localStorage.setItem('endTime', endTime);

    const commonData = {
      title: title.trim(),
      comment: comment.trim(),
      date,
      start_time: startTime,
      end_time: endTime,
      delete_key: deleteKey.trim(),
      agree,
      activities,
      browser_id: browserId,
      ip,
      locations: normalizedLocations,
    };

    const submitJson = async (extra = {}) => {
      try {
        const res = await fetch('/api/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...commonData, ...extra }),
        });
        if (!res.ok) throw new Error(await res.text() || '登録に失敗しました');
        setSubmitted(true);
      } catch (err) {
        setErrors({ submit: err.message });
      } finally {
        setIsSubmitting(false);
      }
    };

    if (photo) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        submitJson({
          photo_base64: base64,
          photo_filename: photo.name,
        });
      };
      reader.readAsDataURL(photo);
    } else {
      await submitJson();
    }
  };


  if (submitted) {
    return (
      <div className="p-4 max-w-xl mx-auto text-center bg-white shadow-md rounded-xl mt-4">
        <p className="mb-4 text-gray-700">登録が完了しました！</p>
        <button
          className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
          onClick={() => {
            setTitle(''); setComment(''); setDate(dayjs().format('YYYY-MM-DD')); setStartTime('12:00');
            setEndTime('12:00'); setLocations(['']); setDeleteKey(''); setAgree(false);
            setActivities([]); setPhoto(null); setSubmitted(false);
          }}
        >
          続けて登録する
        </button>
      </div>
    );
  }

  return (
    <>
      {
        errors.submit && (
          <p className="text-red-600 font-bold mb-2">{errors.submit}</p>
        )
      }

      <form form onSubmit={handleSubmit} className="p-4 max-w-xl mx-auto space-y-4" >
        <p className="error-message font-bold mb-4">* は必須項目です</p>

        {/* タイトル */}
        <div>
          <label className="block"><strong>タイトル *</strong></label>
          <input
            type="text"
            value={title}
            onInput={e => setTitle(e.target.value)}
            placeholder="例：スーパー前スタ活"
            className="border w-full p-2 rounded"
          />
          {errors.title && <p className="error-message text-sm mt-1">{errors.title}</p>}
        </div>

        {/* コメント */}
        <div>
          <label className="block"><strong>コメント</strong></label>
          <textarea
            value={comment}
            onInput={e => setComment(e.target.value)}
            placeholder="例：雨でしたが3人で元気に実施できました！"
            className="border w-full p-2 rounded"
          />
          <small>※個人情報は記載しないでください</small>
        </div>

        {/* 開催日 */}
        <div>
          <label className="block"><strong>開催日 *</strong></label>
          <select value={date} onChange={e => setDate(e.target.value)} className="border w-full p-2 rounded">
            {generateDateOptions()}
          </select>
          {errors.date && <p className="error-message text-sm mt-1">{errors.date}</p>}
        </div>

        {/* 開始／終了時刻 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block"><strong>開始時刻</strong></label>
            <select value={startTime} onChange={e => setStartTime(e.target.value)} className="border w-full p-2 rounded">
              {generateTimeOptions()}
            </select>
          </div>
          <div>
            <label className="block"><strong>終了時刻</strong></label>
            <select value={endTime} onChange={e => setEndTime(e.target.value)} className="border w-full p-2 rounded">
              {generateTimeOptions()}
            </select>
            {errors.time && <p className="error-message text-sm mt-1">{errors.time}</p>}
          </div>
        </div>

        <div>
          <label className="block font-bold mb-1">緯度・経度 *</label>
          {locations.map((loc, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={loc}
                onInput={e => updateLocation(idx, e.currentTarget.value)}
                placeholder="例：35.681236,139.767125"
                className="input-narrow border p-2 rounded flex-grow"
              />
              <button
                type="button"
                onClick={() => removeLocation(idx)}
                disabled={locations.length === 1}
                className="normal-button text-xs"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addLocation}
            disabled={locations.length >= 5}
            className="normal-button text-sm mb-2"
          >
            + 追加
          </button>
          <small className="text-xs block mt-1 mb-2">
            緯度・経度は iPhone のマップまたは Google マップで<br />
            地点を長押し→コピーした「緯度,経度」を貼り付けてください。最大5件まで。
          </small>
          {errors.locations && <p className="error-message text-sm mt-1">{errors.locations}</p>}
        </div>


        {/* 削除キー */}
        <div>
          <label className="block"><strong>削除キー *</strong></label>
          <input
            type="text"
            value={deleteKey}
            onInput={e => setDeleteKey(e.target.value)}
            placeholder="任意の文字列"
            className="border w-full p-2 rounded"
          />
          <small>※この投稿を削除したくなった時に必要です</small>
          {errors.deleteKey && <p className="error-message text-sm mt-1">{errors.deleteKey}</p>}
        </div>

        {/* 写真 */}
        <div>
          <label className="block"><strong>写真アップロード（任意）</strong></label>
          <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])} />
          {photo && <div className="text-sm mt-1">選択されたファイル: {photo.name}</div>}
          <small>※人物が写っている場合は肖像権保護のため、掲載前に必ず許可を取得してください。</small>
          {errors.photo && <p className="error-message text-sm mt-1">{errors.photo}</p>}
        </div>

        <div>
          <label className="block">
            <strong>実施した活動（複数選択可） *</strong>
          </label>
          <br />
          {['スタンディング', 'ビラ配り', 'マイク街宣', 'モニタ街宣', '録音再生'].map((label) => (
            <label key={label} className="block font-normal">
              <input
                type="checkbox"
                value={label}
                checked={activities.includes(label)}
                onChange={handleCheckboxChange}
                className="mr-2"
              />
              {label}
            </label>
          ))}
          {errors.activities && <p className="error-message text-sm mt-1">{errors.activities}</p>}
        </div>

        <div>
          <label className="block">
            <strong>登録情報の取り扱いについて *</strong>
          </label>
          <br />
          <p className="text-xs mt-1 mb-2">
            ご登録いただいた情報や写真は、れいわ草の根プロジェクトの公式SNSで活用させていただきます。
          </p>
          <label className="inline-flex items-center">
            <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} className="mr-2" />
            上記に同意します（必須）
          </label>
          {errors.agree && <p className="error-message text-sm mt-1">{errors.agree}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`pink-button ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? '送信中...' : '登録する'}
        </button>

      </form >
    </>
  );
}
