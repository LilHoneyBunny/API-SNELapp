# Usamos una imagen base de Node.js
FROM node:14


# 1. Modificar sources.list para usar repositorios de archivo
# 2. Ejecutar apt update y luego instalar netcat
RUN echo "deb http://archive.debian.org/debian buster main" > /etc/apt/sources.list && \
    echo "deb http://archive.debian.org/debian-security buster/updates main" >> /etc/apt/sources.list && \
    apt-get update && \
    apt-get install -y netcat-openbsd



# Establecemos el directorio de trabajo en el contenedor
WORKDIR /app

# Copiamos los archivos de nuestra app dentro del contenedor
COPY . .

# Instalamos las dependencias
RUN npm install

# Exponemos el puerto que utilizamos en el contenedor
EXPOSE 3001

# Comando para arrancar el microservicio
CMD ["npm", "start"]