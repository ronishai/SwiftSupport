import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useLocale } from '../hooks/useLocale';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function AdminQrGenerator() {
  const [token, setToken] = useState('');
  const [generating, setGenerating] = useState(false);
  const { lang } = useLocale();

  const docPath = import.meta.env.VITE_QR_TOKEN_DOC_PATH || 'Config/qr-token';
  const isRtl = lang === 'he';

  useEffect(() => {
    getDoc(doc(db, docPath)).then((snapshot) => {
      setToken(snapshot.data()?.value || '');
    });
  }, [docPath]);

  async function generateNewToken() {
    setGenerating(true);
    try {
      const array = new Uint32Array(4);
      window.crypto.getRandomValues(array);
      const newStr = Array.from(array, (num) => num.toString(16)).join('');

      // Update Firebase
      await setDoc(doc(db, docPath), { value: newStr }, { merge: true });
      setToken(newStr);
    } catch (err) {
      console.error('Failed to generate token:', err);
    } finally {
      setGenerating(false);
    }
  }

  const url = `${window.location.origin}?token=${token}`;

  return (
    <div className="min-h-screen mx-auto flex justify-center items-center p-4 space-y-6 bg-gradient-to-br from-primary-50 via-primary-100 to-primary-500/50">
      <Card className="max-w-4xl max-h-fit p-6 border border-slate-200 rounded-3xl shadow-xl bg-white print:hidden">
        <div className={`mb-6 ${isRtl ? 'text-right' : 'text-left'}`}>
          <h3 className="text-xl font-bold text-slate-900">
            {isRtl ? 'ניהול קוד QR לקוחות' : 'Client QR Code Management'}
          </h3>
          <p className="text-sm text-slate-500">
            {isRtl
              ? 'הפק קוד QR מאובטח המאפשר סריקה ופתיחת קריאות שירות ישירות מהנייד'
              : 'Generate secure QR codes for clients to scan and open support tickets.'}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 items-center">
          <div className={`space-y-4 ${isRtl ? 'text-right' : 'text-left'}`}>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                {isRtl ? 'כתובת יעד נוכחית' : 'Target URL Destination'}
              </span>
              <p className="text-sm font-mono text-slate-700 break-all bg-white p-2 rounded-xl border border-slate-200">
                {url}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                onClick={generateNewToken}
                disabled={generating}
                className="flex-1"
              >
                {generating
                  ? isRtl
                    ? 'מפיק קוד...'
                    : 'Generating...'
                  : isRtl
                    ? 'הפק קוד QR חדש'
                    : 'Generate New QR'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => window.print()}
                disabled={!token}
                className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                {isRtl ? 'הדפס שלט לקומות' : 'Print Poster Layout'}
              </Button>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-3xl border border-slate-100 min-h-[280px]">
            {token ? (
              <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200">
                <QRCodeSVG value={url} size={200} />
              </div>
            ) : (
              <div className="text-center text-slate-400 text-sm">
                {isRtl
                  ? 'אין קוד פעיל, לחץ על הפק קוד'
                  : 'No active token. Click generate.'}
              </div>
            )}
          </div>
        </div>
      </Card>

      {token && (
        <div className="hidden print:flex flex-col items-center justify-between h-[95vh] w-full max-w-2xl mx-auto border-[12px] border-slate-900 p-12 my-auto bg-white rounded-[40px] text-center font-sans tracking-wide">
          <div className="space-y-4 mt-6">
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">
              {isRtl ? 'צריך עזרה טכנית?' : 'Need IT Support?'}
            </h1>
            <p className="text-2xl text-slate-500 font-medium">
              {isRtl
                ? 'פתרון תקלות בקליק מהנייד'
                : 'Open a service ticket instantly'}
            </p>
          </div>

          <div className="p-8 bg-white border-4 border-slate-900 rounded-[32px] shadow-2xl my-auto">
            <QRCodeSVG value={url} size={340} />
          </div>

          <div className="space-y-6 mb-6">
            <div className="bg-slate-900 text-white text-xl font-bold px-8 py-4 rounded-full uppercase tracking-widest inline-block shadow-lg">
              {isRtl ? 'סרוק לפתיחת תקלה' : 'Scan to Report an Issue'}
            </div>
            <p className="text-sm font-mono text-slate-400 mt-4 max-w-md mx-auto break-all">
              {url}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
