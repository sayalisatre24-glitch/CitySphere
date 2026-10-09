import React, { useState, useRef } from 'react';
import { Mic, Square, Play, Pause, Trash2, CheckCircle2 } from 'lucide-react';

const VoiceRecorder = ({ onAudioReady, onAudioClear }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioPlayerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        if (onAudioReady) {
          onAudioReady(audioBlob);
        }
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordSeconds(prev => {
          if (prev >= 60) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied or error:', err);
      alert('Microphone permission is required to record a voice note for your citizen report.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const clearAudio = () => {
    setAudioUrl(null);
    setIsPlaying(false);
    setRecordSeconds(0);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    if (onAudioClear) {
      onAudioClear();
    }
  };

  const togglePlayAudio = () => {
    if (!audioPlayerRef.current) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div
      style={{
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {!audioUrl ? (
          !isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="btn btn-rose btn-sm"
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              <Mic size={15} />
              <span>Record Voice Note</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="btn btn-rose btn-sm"
              style={{ borderRadius: 'var(--radius-full)', animation: 'pulseRed 1.5s infinite' }}
            >
              <Square size={15} />
              <span>Stop Recording ({recordSeconds}s)</span>
            </button>
          )
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={togglePlayAudio}
              className="btn btn-primary btn-sm"
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{isPlaying ? 'Pause' : 'Play Voice Note'}</span>
            </button>

            <button
              type="button"
              onClick={clearAudio}
              className="btn btn-secondary btn-sm"
              style={{ borderRadius: 'var(--radius-full)' }}
              title="Delete audio note"
            >
              <Trash2 size={14} color="var(--rose)" />
            </button>

            <span style={{ fontSize: '0.78rem', color: 'var(--emerald-dark)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
              <CheckCircle2 size={14} color="var(--emerald)" /> Recorded ({recordSeconds}s)
            </span>

            <audio
              ref={audioPlayerRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              style={{ display: 'none' }}
            />
          </div>
        )}
      </div>

      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Max 60s voice message for rapid field reporting
      </div>
    </div>
  );
};

export default VoiceRecorder;
