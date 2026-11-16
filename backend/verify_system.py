import urllib.request
import urllib.parse
import urllib.error
import json
import sys
import io

BASE_URL = "http://127.0.0.1:236/api/v1"

def check(name, success, info=""):
    status = "PASS" if success else "FAIL"
    print(f"[{status}] {name} {info}")
    if not success:
        raise AssertionError(f"Failed step: {name} - {info}")

def http_get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Verifier"})
    with urllib.request.urlopen(req) as resp:
        return resp.getcode(), json.loads(resp.read().decode("utf-8"))

def http_post_json(url, payload):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json", "User-Agent": "Verifier"})
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.getcode(), json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            parsed = json.loads(body)
        except Exception:
            parsed = body
        return e.code, parsed

def http_post_multipart_csv(url, csv_text, filename="test.csv"):
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'
        f"Content-Type: text/csv\r\n\r\n"
        f"{csv_text}\r\n"
        f"--{boundary}--\r\n"
    ).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=body,
        headers={
            "Content-Type": f"multipart/form-data; boundary={boundary}",
            "User-Agent": "Verifier",
        },
    )
    with urllib.request.urlopen(req) as resp:
        return resp.getcode(), json.loads(resp.read().decode("utf-8"))

def main():
    print("=" * 65)
    print("INTELLIEMO FULL-STACK COMPREHENSIVE VERIFICATION")
    print("=" * 65)

    # 1. Health
    code, data = http_get(f"{BASE_URL}/health")
    check("Health Check Status Code", code == 200, f"Code: {code}")
    check("Model Loaded in Health", data.get("model_loaded") is True, f"Data: {data}")
    check("Database Connected", data.get("database") == "connected", f"DB: {data.get('database')}")

    # 2. Supported emotions
    code, data = http_get(f"{BASE_URL}/emotions")
    check("Emotions Endpoint", code == 200)
    emotions = data.get("emotions", [])
    check("Emotions Count >= 6", len(emotions) >= 6, f"Emotions: {emotions}")

    # 3. Analyze Emotion - Joy
    text_joy = "I am so incredibly happy, ecstatic and proud of this amazing milestone!"
    code, joy_data = http_post_json(f"{BASE_URL}/analyze", {"text": text_joy, "include_explanation": True})
    check("Analyze Joy 200", code == 200)
    check("Joy Dominant Detection", joy_data["dominant_emotion"] == "joy", f"Got: {joy_data['dominant_emotion']} ({joy_data['confidence']:.2%})")
    check("Joy Explanation Present", "tokens" in joy_data.get("explanation", {}), f"Explanation tokens: {len(joy_data.get('explanation', {}).get('tokens', []))}")

    # 4. Analyze Emotion - Sadness
    text_sad = "I feel completely heartbroken, depressed, and grieving over this terrible loss."
    code, sad_data = http_post_json(f"{BASE_URL}/analyze", {"text": text_sad, "include_explanation": True})
    check("Analyze Sadness 200", code == 200)
    check("Sadness Dominant Detection", sad_data["dominant_emotion"] == "sadness", f"Got: {sad_data['dominant_emotion']} ({sad_data['confidence']:.2%})")

    # 5. Analyze Emotion - Fear
    text_fear = "I am terrified, trembling in panic and horror about what lurks in the darkness."
    code, fear_data = http_post_json(f"{BASE_URL}/analyze", {"text": text_fear, "include_explanation": True})
    check("Analyze Fear 200", code == 200)
    check("Fear Dominant Detection", fear_data["dominant_emotion"] == "fear", f"Got: {fear_data['dominant_emotion']} ({fear_data['confidence']:.2%})")

    # 6. Analyze Emotion - Anger
    text_anger = "I am furious, enraged and completely sick of this disgusting fraud!"
    code, anger_data = http_post_json(f"{BASE_URL}/analyze", {"text": text_anger, "include_explanation": True})
    check("Analyze Anger 200", code == 200)
    check("Anger Dominant Detection", anger_data["dominant_emotion"] == "anger", f"Got: {anger_data['dominant_emotion']} ({anger_data['confidence']:.2%})")

    # 7. Compound / Shift Analysis
    text_shift = "I was terrified and full of dread before, but now I feel overjoyed, relieved and happy!"
    code, shift_data = http_post_json(f"{BASE_URL}/analyze", {"text": text_shift, "include_explanation": True})
    check("Analyze Shift 200", code == 200)
    check("Shift Trajectory Present", "emotional_shift" in shift_data and shift_data["emotional_shift"] is not None, f"Shift: {shift_data.get('emotional_shift')}")
    print(f"   -> Detected shift: '{shift_data.get('emotional_shift')}', Dominant: {shift_data.get('dominant_emotion')}, Secondary: {shift_data.get('secondary_emotion')}")

    # 8. Model Endpoints
    code, model_info = http_get(f"{BASE_URL}/model")
    check("Model Info 200", code == 200)
    check("Model Name Check", "Ayush Vishwakarma" in model_info.get("name", ""), f"Model name: {model_info.get('name')}")

    code, metrics = http_get(f"{BASE_URL}/model/metrics")
    check("Model Metrics 200", code == 200)
    check("Macro F1 Present", "macro_f1" in metrics or "accuracy" in metrics, f"Metrics keys: {list(metrics.keys())}")

    code, _ = http_get(f"{BASE_URL}/model/confusion-matrix")
    check("Confusion Matrix 200", code == 200)

    code, _ = http_get(f"{BASE_URL}/model/comparison")
    check("Model Comparison 200", code == 200)

    code, _ = http_get(f"{BASE_URL}/model/status")
    check("Model Status 200", code == 200)

    # 9. Analytics Endpoints
    code, summary = http_get(f"{BASE_URL}/analytics/summary")
    check("Analytics Summary 200", code == 200)
    check("Total Analyses > 0", summary.get("total_analyses", 0) > 0, f"Total analyses: {summary.get('total_analyses')}")

    code, _ = http_get(f"{BASE_URL}/analytics/emotions")
    check("Analytics Emotions 200", code == 200)

    code, _ = http_get(f"{BASE_URL}/analytics/confidence")
    check("Analytics Confidence 200", code == 200)

    code, _ = http_get(f"{BASE_URL}/analytics/trends")
    check("Analytics Trends 200", code == 200)

    # 10. History Endpoints
    code, hist = http_get(f"{BASE_URL}/analyses?limit=10")
    check("History Analyses 200", code == 200)
    check("History Items Exist", len(hist.get("items", [])) > 0, f"Count: {len(hist.get('items', []))}")
    first_id = hist["items"][0]["id"]

    code, _ = http_get(f"{BASE_URL}/analyses/{first_id}")
    check("Get Single Analysis by ID 200", code == 200, f"ID: {first_id}")

    # 11. Batch Analysis Endpoint
    csv_content = "text\nI feel so happy and excited!\nI am very sad and depressed.\nWhat a shocking surprise!\n"
    code, batch_res = http_post_multipart_csv(f"{BASE_URL}/analyze/batch", csv_content, "batch_test.csv")
    check("Batch Analyze 200", code == 200, f"Status: {code}")
    check("Batch Records Processed == 3", batch_res.get("processed") == 3, f"Processed: {batch_res.get('processed')}")
    check("Batch Records Successful == 3", batch_res.get("successful") == 3, f"Successful: {batch_res.get('successful')}")

    # 12. Input Validations
    code, _ = http_post_json(f"{BASE_URL}/analyze", {"text": "", "include_explanation": False})
    check("Empty Text Rejected (400 or 422)", code in (400, 422), f"Code: {code}")

    code, _ = http_post_json(f"{BASE_URL}/analyze", {"text": "   ", "include_explanation": False})
    check("Whitespace-only Text Rejected (400)", code == 400, f"Code: {code}")

    code, _ = http_post_json(f"{BASE_URL}/analyze", {"text": "A" * 2001, "include_explanation": False})
    check("Overly Long Text Rejected (400 or 422)", code in (400, 422), f"Code: {code}")

    print("\n" + "=" * 65)
    print("ALL 12 BACKEND & INFERENCE TEST SUITES PASSED 100%!")
    print("=" * 65)

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\nFAILED: {e}")
        sys.exit(1)
