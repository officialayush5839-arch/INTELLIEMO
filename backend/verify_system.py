import urllib.request
import urllib.parse
import urllib.error
import json
import sys
import io
import os
import time

TEST_PORT = int(os.environ.get("TEST_PORT", os.environ.get("PORT", 8000)))
BASE_URL = f"http://127.0.0.1:{TEST_PORT}/api/v1"

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
    print(f"Targeting Base URL: {BASE_URL}")
    print("=" * 65)

    # Wait for server readiness and model loading
    print("Waiting for server and model to become ready...")
    ready = False
    data = {}
    for attempt in range(40):
        try:
            code, data = http_get(f"{BASE_URL}/health")
            if code == 200 and data.get("model_loaded") is True:
                ready = True
                print(f"Server and model are ready after {attempt * 2}s.")
                break
        except Exception:
            pass
        time.sleep(2)

    if not ready:
        raise RuntimeError(f"Server or model at {BASE_URL}/health did not become ready within 80 seconds. Last state: {data}")

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
    text_sad = "I feel utterly heartbroken, devastated and overwhelmed by sorrow today."
    code, sad_data = http_post_json(f"{BASE_URL}/analyze", {"text": text_sad, "include_explanation": True})
    check("Analyze Sadness 200", code == 200)
    check("Sadness Dominant Detection", sad_data["dominant_emotion"] == "sadness", f"Got: {sad_data['dominant_emotion']} ({sad_data['confidence']:.2%})")

    # 5. Mixed Emotions / Discourse Transition Test
    text_mixed = "I was terrified at the beginning of the interview, but after some time I felt completely confident and joyful."
    code, mixed_data = http_post_json(f"{BASE_URL}/analyze", {"text": text_mixed, "include_explanation": True})
    check("Mixed Emotion Analysis 200", code == 200)
    check("Discourse Multi-Emotion Identified", mixed_data.get("is_mixed_emotion") is True or mixed_data.get("secondary_emotion") is not None, f"Shift: {mixed_data.get('emotional_shift')}")

    # 6. CSV Batch Analysis
    csv_sample = (
        "text,category\n"
        "\"I love this new feature so much, wonderful work!\",feedback\n"
        "\"I am furious that the server crashed during peak traffic\",support\n"
        "\"Just finished lunch at my desk.\",notes\n"
    )
    code, batch_data = http_post_multipart_csv(f"{BASE_URL}/analyze/batch", csv_sample, "test_cases.csv")
    check("Batch Upload 200", code == 200)
    check("Batch Processed Count", batch_data.get("total_records") == 3, f"Total: {batch_data.get('total_records')}")
    check("Batch Successful Count", (batch_data.get("successful") or batch_data.get("successful_records")) == 3, f"Success: {batch_data.get('successful')}")

    # 7. Model Info Endpoint
    code, model_data = http_get(f"{BASE_URL}/model")
    check("Model Info 200", code == 200)
    check("Model Architecture DistilBERT", model_data.get("architecture") == "DistilBERT", f"Arch: {model_data.get('architecture')}")
    check("Model Loaded Flag", model_data.get("loaded") is True, f"Loaded: {model_data.get('loaded')}")

    # 8. History / Analyses Endpoint
    code, history_data = http_get(f"{BASE_URL}/analyses?limit=5")
    check("History Endpoint 200", code == 200)
    check("History Contains Items", len(history_data.get("items", [])) > 0, f"Items: {len(history_data.get('items', []))}")

    # 9. Analytics Summary
    code, analytics_data = http_get(f"{BASE_URL}/analytics/summary")
    check("Analytics Summary 200", code == 200)
    check("Analytics Analyses Count", analytics_data.get("total_analyses", 0) > 0, f"Total: {analytics_data.get('total_analyses')}")
    check("Emotion Distribution Present", "emotion_distribution" in analytics_data, "Distribution found")

    # 10. Input Validation (Empty Text & Oversized Text)
    code, empty_resp = http_post_json(f"{BASE_URL}/analyze", {"text": "   "})
    check("Empty Text 400 Rejected", code == 400, f"Code: {code}")

    code, huge_resp = http_post_json(f"{BASE_URL}/analyze", {"text": "A" * 2500})
    check("Huge Text 400 Rejected", code == 400, f"Code: {code}")

    print("=" * 65)
    print("ALL 10 FULL-STACK VERIFICATION CHECKS PASSED WITH 100% SUCCESS!")
    print("=" * 65)

if __name__ == "__main__":
    main()
