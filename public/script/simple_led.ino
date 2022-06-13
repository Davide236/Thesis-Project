const int LED = 5; //PIN of the LED
const int Photoresistor = A0; //Pin of the Photoresistor module
int value = 0;

void setup() {
  Serial.begin(115200);
  pinMode(LED, OUTPUT);
  pinMode(Photoresistor, INPUT);
}

//Intensity goes from 0 to 255
void change_intensity(int n) {
  //Set the intensity to 0-255 range
  int intensity = int(((float(n)*float(255))/float(100)));
  if (intensity > 255) {
    intensity = 255;
  }
  if (intensity < 0) {
    intensity = 0;
  }
  analogWrite(LED,intensity);
}

//Function which returns the value of the sensor
void get_value() {
  int val = analogRead(Photoresistor); //Value from sensor 
  Serial.println(val);
}

void loop() {
  while (!Serial.available());
  value = Serial.readString().toInt();
  //Serial.println(value);
  if (value == 1) {
    get_value();
  } else {
    change_intensity(value);
  }

}
