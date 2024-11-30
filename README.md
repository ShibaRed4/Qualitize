<!-- Banner Section (Insert your banner image URL here) -->
<p align="center">
  <img src="https://github.com/ShibaRed4/Qualitize/blob/main/.github/icon.png" alt="Qualitize Banner" />
</p>

<!-- Badges Section -->
<div align="center">

  <a href="">![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)</a>
  <a href="">![Micropython](https://img.shields.io/badge/micropython-2B2728?style=for-the-badge&logo=micropython&logoColor=white)</a>
  <a href="">![Espressif](https://img.shields.io/badge/espressif-E7352C?style=for-the-badge&logo=espressif&logoColor=white)</a>
  <br>
  <a href="">![OpenCV](https://img.shields.io/badge/opencv-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white)</a>
</div>


<!-- Title Section -->
<h1 align="center" style="font-size: 35px; font-weight: bold">Qualitize</h1>
<h2 align="center">
    Qualitize is a MESA project designed and maintained by highschool students. Our goal is to make a product that assists the blind
    with the help of AI technology. This repository stores our source-code for both the chip and the server.
</h2>

# Tech Stack:
Server:
- Python
- Ultralytics (RTDETR)

Client:
- Micropython (custom camera firmware)
- XIAO ESP32S3


# Features:

- Object Detection

# Todo:

- [ ] Wake-Word Detection
- [ ] Text-To-Speech Assistant
- [ ] Object Detection with Distance Calculation
- [ ] Warning/Alert System
- [ ] Mobile App for customizability.

# Reasons for Server-Client Architecture:

We chose to use a server-client architecture because we've realized that our small ESP32S3 chip couldn't really handle the load of real time
object detection alongside our other wanted features such as having a text-to-speech assistant, we concurred that having the server do all the heavy processing while having the client only request certain data at certain times was the best approach for sustainability.


# Installation/Demo:

Server (Windows):

```
    git clone https://github.com/ShibaRed4/Qualitize.git
    cd Qualitize

    python -m venv .
    
    # Activate the virtual environment script: https://docs.python.org/3/library/venv.html

    pip install -r requirements.txt

    python server/server.py
```

Client:

-> Requirements:
- [Thonny](https://thonny.org/)
- USB-A to USB-C cable with data transfer capabilities
- XIAO ESP32S3 Board with Camera attached.
- [Custom Micropython Camera firmware](https://files.seeedstudio.com/wiki/wiki-ranger/Contributions/S3-MicroPy/XIAO_ESP32S3_Micropython.zip).
- Python

-> Setup:

--> In the Terminal:
```
# Make sure you've downloaded and unzipped the custom firmware.
# Make sure the chip/board is connected via USB-C cable.

pip install esptool setuptools

# Make sure your chip is in bootloader mode (Hold down the "Boot" button while plugging the cable in.)

esptool --chip esp32s3 --port COMXX erase_flash

cd "XIAO ESP32S3 Micropython"

esptool --port COMXX --baud 460800 --before default_reset --after hard_reset --chip esp32s3  write_flash --flash_mode dio --flash_size detect --flash_freq 80m 0x0 firmware.bin 

# Congrats you're almost there!
# Reconnect the board, this time without holding the boot button.
```
--> In Thonny IDE:
- Go to File > Open > Where you put the Qualitize folder.
- Tools > Options > Interpreter 
- Select "Micropython" for the top option
- Select the option that has the port, you can find the port using Device Manager on Windows.
- Press OK
- On the left-hand size, there should be two folders. (server & client)
- Click on the "+" icon left to the folder for client.
- Press right-click on main.py and press "Upload to /"
- Press right-click on the "lib" folder and press "Upload to /"
- Press right-click on .env file and press "Upload to /"
- Change the details in the .env file as you see fit.
- Once you're done with everything, click on the shell until your cursor is to the right of the ">>>"
- Press Ctrl+D and your board should be sending requests to the server! (Make sure the server is up lmao)