FROM node:20.10.0

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.
RUN apt-get update \
    && apt-get install -y wget gnupg tightvncserver xfce4 xfce4-goodies xfonts-base dbus-x11 \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
    && sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-khmeros fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Setup VNC server
RUN mkdir /root/.vnc \
    && echo "password" | vncpasswd -f > /root/.vnc/passwd \
    && chmod 600 /root/.vnc/passwd

RUN touch /root/.Xauthority
RUN Xvfb :1 -screen 0 1024x768x24 &

ENV DISPLAY=:1

ENV USER=root

# Set display resolution (change as needed)
ENV RESOLUTION=1920x1080

# Expose VNC port
EXPOSE 5901

RUN mkdir -p /app
COPY . /app/
WORKDIR /app
ENV NODE_PATH=/app/node_modules

RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app
RUN chmod +x start-vnc.sh \
    && chmod +x wrapper.sh

USER pptruser

RUN yarn install

ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome-stable"
RUN printf "password\npassword\nn" | vncpasswd

EXPOSE 3000
CMD ./wrapper.sh
