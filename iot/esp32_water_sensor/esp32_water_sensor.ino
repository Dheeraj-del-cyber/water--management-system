#include <WiFi.h>
#include <HTTPClient.h>

// --- Configuration ---
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

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

// Interrupt Service Routine for Flow Sensor
void IRAM_ATTR pulseCounter() {
  pulseCount++;
}

void setup() {
  Serial.begin(115200);

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi network with IP Address: ");
  Serial.println(WiFi.localIP());

  // Setup Sensor
  pinMode(sensorPin, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(sensorPin), pulseCounter, FALLING);
}

void loop() {
  // Read sensor data every 1 second
  if ((millis() - oldTime) > 1000) { 
    // Disable interrupt while calculating
    detachInterrupt(digitalPinToInterrupt(sensorPin));
    
    // Calculate flow rate in L/min
    // (Pulse frequency x 60 min) / 7.5Q = flowrate in L/hour (7.5 is sensor calibration factor)
    flowRate = ((1000.0 / (millis() - oldTime)) * pulseCount) / 7.5;
    oldTime = millis();
    
    // Calculate volume passed in this second
    flowMilliLitres = (flowRate / 60) * 1000;
    totalLitres += (flowMilliLitres / 1000.0);
    
    Serial.print("Flow rate: ");
    Serial.print(flowRate);
    Serial.print(" L/min\t");
    Serial.print("Total Liquid: ");
    Serial.print(totalLitres);
    Serial.println(" L");

    // Send data to server every time 1 Litre is consumed, OR periodically (e.g., every 1 minute)
    // For this example, let's send data if flowRate > 0 and 10 seconds have passed
    static unsigned long lastSendTime = 0;
    if (flowRate > 0 && (millis() - lastSendTime > 10000)) {
        sendDataToServer(totalLitres, flowRate);
        lastSendTime = millis();
        
        // Reset local counter if you want to track per-session, 
        // or keep it running depending on your logic.
        totalLitres = 0; 
    }
    
    // Reset pulse count and re-enable interrupt
    pulseCount = 0;
    attachInterrupt(digitalPinToInterrupt(sensorPin), pulseCounter, FALLING);
  }
}

void sendDataToServer(float amountLitres, float currentFlowRate) {
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

    int httpResponseCode = http.POST(payload);
    
    if (httpResponseCode > 0) {
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
    } else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
    }
    
    http.end();
  } else {
    Serial.println("WiFi Disconnected");
  }
}
