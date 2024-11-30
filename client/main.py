import uasyncio
import camera
import network
import uwebsockets.client
import time
from env import load_env


# Setup Wifi

env_vars = load_env('.env')
SSID = env_vars['SSID']
Password = env_vars['Password']

# Server Config

ServerIP = env_vars["SERVER_IP"]
Port = env_vars["PORT"]
Endpoint = "/detect"


def connect_to_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(SSID, Password)
    print("Connecting to Wifi...⌛")
    while not wlan.isconnected():
        pass
    print("Successfully connected.")
    print(f"IP: {wlan.ifconfig()[0]}")


# Camera Setup
def setup_camera():
    try:
        camera.init()
        camera.framesize(10)
        print("Camera successfully setup. ✅")
    except Exception as e:
        print(f"Error setting up camera: {e}")
        raise

def connect_to_server():
    try:
        print(f"Connecting to ws://{ServerIP}:{Port}{Endpoint}")
        websocket = uwebsockets.client.connect(f"ws://{ServerIP}:{Port}{Endpoint}")
        
        if websocket:
            print("WebSocket connection established. Press Ctrl+C to exit.")
            while True:
                buf = camera.capture()  # Capture a frame from the camera
                websocket.send(buf)  # Send the frame
                print("Frame sent. Waiting for next...")
                
                # Try to receive any response from the server
                try:
                    message = websocket.recv()  # Receive message from server
                    print(f"Received from server: {message}")
                except Exception as e:
                    print(f"Error receiving data: {e}")
                
                time.sleep(0.5)  # Non-blocking delay between frames
        else:
            print("Failed to establish WebSocket connection.")
    except Exception as e:
        print(f"Error during WebSocket communication: {e}")
    finally:
        print("Cleaning up resources...")
        camera.deinit()  # Ensure the camera is properly released
        print("Camera released.")


# Main function
def main():
    # Connect to Wi-Fi and set up the camera
    connect_to_wifi()
    setup_camera()

    # Connect to the WebSocket server and handle sending/receiving data
    connect_to_server()


# Run the main function
try:
    main()  # Start the program
except KeyboardInterrupt:
    print("\nScript interrupted by user. Exiting...")
