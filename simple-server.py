#!/usr/bin/env python3
"""
Servidor HTTP simple para servir el juego Retro Arcade
Uso: python simple-server.py
"""
import http.server
import socketserver
import os
import webbrowser
from urllib.parse import urlparse

PORT = 8080

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def run_server():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        print(f"🎮 Servidor iniciado en http://localhost:{PORT}")
        print(f"📁 Sirviendo archivos desde: {os.getcwd()}")
        print(f"🚀 Abre http://localhost:{PORT}/retro-arcade-game.html para jugar")
        print("Presiona Ctrl+C para detener el servidor")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Servidor detenido")

if __name__ == "__main__":
    run_server()