// AquaSmart ESP32 Water Sensor Sketch (cleaned and robust)
#include <WiFi.h>
#include <HTTPClient.h>

// --- Configuration ---
const char* ssid = "CMF Phone 2 Pro";
const char* password = "dheerajkoila";

// Server endpoint (replace with your computer's local IP or deployed server URL)
const char* serverName = "http://10.252.70.229:3000/api/iot/log";

// Hostel Room config for this specific device
const String roomNumber = "101";

// --- Sensor Variables ---
const int sensorPin = 2; // GPIO pin connected to the water flow sensor
volatile int pulseCount = 0;
float flowRate = 0.0;
unsigned int flowMilliLitres = 0;
float totalLitres = 0.0;
unsigned long oldTime = 0;

// Timing for sending data
unsigned long lastSendTime = 0;

// Interrupt Service Routine for Flow Sensor
void IRAM_ATTR pulseCounter() {
	pulseCount++;
}

// Forward declarations
void sendDataToServer(float amountLitres, float currentFlowRate);
void connectWiFi();

void setup() {
	Serial.begin(115200);

	// Connect to Wi-Fi
	connectWiFi();

	// Setup Sensor
	pinMode(sensorPin, INPUT_PULLUP);
	attachInterrupt(digitalPinToInterrupt(sensorPin), pulseCounter, FALLING);

	oldTime = millis();
}

void loop() {
	// Read sensor data every 1 second
	if ((millis() - oldTime) > 1000) {
		// Disable interrupt while calculating
		detachInterrupt(digitalPinToInterrupt(sensorPin));

		unsigned long currentTime = millis();
		unsigned long delta = currentTime - oldTime;
		if (delta == 0) delta = 1;

		// Calculate flow rate in L/min
		flowRate = ((1000.0 / delta) * pulseCount) / 7.5;
		oldTime = currentTime;

		// Calculate volume passed in this second
		flowMilliLitres = (flowRate / 60.0) * 1000.0;
		totalLitres += (flowMilliLitres / 1000.0);

		Serial.print("Flow rate: ");
		Serial.print(flowRate);
		Serial.print(" L/min\t");
		Serial.print("Total Liquid: ");
		Serial.print(totalLitres);
		Serial.println(" L");

		// Send data to server when flow is detected and at least 10 seconds passed
		if (flowRate > 0 && (millis() - lastSendTime > 10000)) {
			sendDataToServer(totalLitres, flowRate);
			lastSendTime = millis();
			// Reset local counter if you want to track per-send
			totalLitres = 0;
		}

		// Reset pulse count and re-enable interrupt
		pulseCount = 0;
		attachInterrupt(digitalPinToInterrupt(sensorPin), pulseCounter, FALLING);
	}
}

void sendDataToServer(float amountLitres, float currentFlowRate) {
	// Ensure WiFi is connected, attempt reconnect if needed
	if (WiFi.status() != WL_CONNECTED) {
		Serial.println("WiFi not connected, attempting to reconnect...");
		connectWiFi();
	}

	if (WiFi.status() == WL_CONNECTED) {
		HTTPClient http;
		http.begin(serverName);
		http.addHeader("Content-Type", "application/json");

		// Create JSON payload
		String payload = "{\"roomNumber\":\"" + roomNumber + "\",";
		payload += "\"amountLitres\":" + String(amountLitres, 2) + ",";
		payload += "\"flowRate\":" + String(currentFlowRate, 2) + "}";

		Serial.print("Sending Payload: ");
		Serial.println(payload);

		int attempts = 0;
		int httpResponseCode = -1;
		while (attempts < 3) {
			httpResponseCode = http.POST(payload);
			if (httpResponseCode > 0) break;
			attempts++;
			Serial.print("POST failed, retrying #"); Serial.println(attempts);
			delay(500);
		}

		if (httpResponseCode > 0) {
			Serial.print("HTTP Response code: ");
			Serial.println(httpResponseCode);
		} else {
			Serial.print("Error code: ");
			Serial.println(httpResponseCode);
		}

		http.end();
	} else {
		Serial.println("WiFi still disconnected, skipping send.");
	}
}

// Reusable WiFi connection helper
void connectWiFi() {
	if (WiFi.status() == WL_CONNECTED) return;
	WiFi.mode(WIFI_STA);
	WiFi.begin(ssid, password);
	Serial.print("Connecting to WiFi");
	unsigned long start = millis();
	while (WiFi.status() != WL_CONNECTED && millis() - start < 20000) {
		delay(500);
		Serial.print('.');
	}
	if (WiFi.status() == WL_CONNECTED) {
		Serial.println("\nConnected to WiFi network with IP Address: ");
		Serial.println(WiFi.localIP());
	} else {
		Serial.println("\nFailed to connect to WiFi within timeout.");
	}
}

