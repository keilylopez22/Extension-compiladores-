# 1. Clonar el repo
git clone <tu-repo>
cd EXT-1

# 2. Instalar dependencias
npm install

# 3. Compilar TypeScript
npm run compile

# 4. Probar en VS Code
# Abre la carpeta en VS Code y presiona F5

# 5. Empaquetar
vsce package

# 6. Publicar (necesitas hacer vsce login primero)
vsce login chuckgt
vsce publish
