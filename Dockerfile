# Usa imagen base de Node LTS
FROM node:18-alpine

# Crea el directorio de la app
WORKDIR /app

# Copia package.json y lock
COPY package*.json ./

# Instala dependencias
RUN npm install

# Copia el resto del código
COPY . .

# Compila TypeScript (si aplica)
RUN npm run build || echo "no build step found"

# Expone el puerto del backend
EXPOSE 4000

# Comando por defecto
CMD ["npm", "run", "start"]
