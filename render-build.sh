rm -rf intern-stack/dist intern-stack/node_modules intern-stack-backend/node_modules
echo "Removed modules"
echo "Installing spa dependencies"
cd intern-stack
npm install -f && npm run build
echo "Installing backend dependencies"
cd ..
cd intern-stack-backend
npm install -f