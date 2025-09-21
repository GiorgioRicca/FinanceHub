# dalla root
npm install
npm i -D concurrently

python -m venv venv
## macOS/Linux
source venv/bin/activate

## Windows (PowerShell)
.\venv\Scripts\Activate.ps1


pip install -r server/requirements.txt || \
pip install Flask flask-cors marshmallow python-dateutil flask-swagger-ui types-Flask-Cors

npm run dev

#Frontend disponibile su http://localhost:5173/

