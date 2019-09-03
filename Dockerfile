FROM node:10.16.3

#RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
#    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
#    && apt-get update \
#    && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf \
#      --no-install-recommends \
#    && rm -rf /var/lib/apt/lists/*



#RUN sysctl -w kernel.unprivileged_userns_clone=1
#RUN echo 'kernel.unprivileged_userns_clone = 1' | tee /etc/sysctl.d/99-enable-user-namespaces.conf
#RUN /build/update-linux-sandbox.sh
#RUN echo 'kernel.unprivileged_userns_clone=1' > /etc/sysctl.d/00-local-userns.conf

# Install puppeteer so it's available in the container.
#RUN npm i puppeteer \
#    # Add user so we don't need --no-sandbox.
#    # same layer as npm install to keep re-chowned files from using up several hundred MBs more space
#    && groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
#    && mkdir -p /home/pptruser/Downloads \
#    && chown -R pptruser:pptruser /home/pptruser \
#    && chown -R pptruser:pptruser /app/node_modules
#

## Run everything after as non-privileged user.
#USER pptruser
#
#

RUN apt-get update && \
    apt-get -y install xvfb gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 \
      libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 \
      libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 \
      libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 \
      libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /app
#ADD package.json /app
COPY . /app/
WORKDIR /app
ENV NODE_PATH=/app/node_modules
RUN npm install

# Add user so we don't need --no-sandbox.
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app/node_modules


#RUN cd /app/node_modules/puppeteer/.local-chromium/$(ls /app/node_modules/puppeteer/.local-chromium/)/chrome-linux/

#CMD bash

#RUN chown root:root chrome_sandbox
#RUN chmod 4755 chrome_sandbox
# copy sandbox executable to a shared location
#RUN cp -p chrome_sandbox /usr/local/sbin/chrome-devel-sandbox
# export CHROME_DEVEL_SANDBOX env variable
#ENV CHROME_DEVEL_SANDBOX=/usr/local/sbin/chrome-devel-sandbox
#

USER pptruser
EXPOSE 3000
CMD npm start
#CMD bash