import whisper
import os

_model = None

def transcribe_audio(audio_path: str) -> str:
    global _model

    if not os.path.exists(audio_path):
        raise RuntimeError(f"Audio file not found: {audio_path}")

    if _model is None:
        _model = whisper.load_model("tiny")  
    
    result = _model.transcribe(
    audio_path,
    language="en",     
    task="transcribe"
)


    return result["text"]
