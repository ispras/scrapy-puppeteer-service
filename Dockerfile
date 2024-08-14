FROM node:22

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.
RUN apt-get update \
    && apt-get install -y wget gnupg tightvncserver xfce4 xfce4-goodies xfonts-base dbus-x11 expect \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
    && sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-khmeros fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends

# Setup VNC server
RUN mkdir /root/.vnc \
    && echo "password" | vncpasswd -f > /root/.vnc/passwd \
    && chmod 600 /root/.vnc/passwd

ENV USER=root

# Set display resolution (change as needed)
ENV RESOLUTION=1920x1080

# Expose VNC port
EXPOSE 5901

# Copy a script to start the VNC server
# COPY start-vnc.sh start-vnc.sh
# RUN chmod +x start-vnc.sh
# RUN bash ./start-vnc.sh

RUN mkdir -p /app
COPY . /app/
WORKDIR /app
ENV NODE_PATH=/app/node_modules

RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app \
    && chmod +x start-vnc.sh

USER pptruser

RUN expect -c 'spawn ./start-vnc.sh; expect "Password: "; send "password\r"; expect "Verify: "; send "password\r"; interact'
# RUN printf "password\rpassword" | ./start-vnc.sh

RUN yarn install

RUN rm -rf /var/lib/apt/lists/*

EXPOSE 3000
CMD npm start
