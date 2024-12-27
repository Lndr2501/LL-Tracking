# Verwende ein Node.js-Image als Basis
FROM node:14

# Erstelle ein Verzeichnis für die Anwendung
WORKDIR /usr/src/app

# Kopiere die package.json und package-lock.json
COPY package*.json ./

# Installiere die Abhängigkeiten
RUN npm install

# Kopiere den Rest der Anwendung
COPY . .

# Exponiere den Port, auf dem die Anwendung läuft
EXPOSE 3000

# Starte die Anwendung
CMD ["npm", "start"]