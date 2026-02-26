# 📚 Guía de Comandos Git para Mi Portafolio

## 🚀 Comandos Básicos

| Comando | Explicación |
|---------|-------------|
| `git init` | Inicializa un repositorio Git en la carpeta actual |
| `git status` | Muestra el estado de los archivos (modificados, nuevos, etc.) |
| `git add .` | Agrega TODOS los archivos modificados al área de preparación |
| `git add archivo.html` | Agrega un archivo específico |
| `git commit -m "mensaje"` | Crea un commit con los archivos preparados |
| `git log` | Muestra el historial de commits |
| `git log --oneline` | Muestra el historial resumido |

## 🔄 Sincronización con GitHub

| Comando | Explicación |
|---------|-------------|
| `git remote -v` | Muestra los repositorios remotos configurados |
| `git remote add origin URL` | Conecta el repositorio local con GitHub |
| `git remote set-url origin URL` | Cambia la URL del repositorio remoto |
| `git branch -M main` | Renombra la rama actual a 'main' |
| `git push -u origin main` | Sube los cambios a GitHub (primera vez) |
| `git push` | Sube los cambios después de la primera vez |
| `git pull` | Trae los cambios desde GitHub |

## 🌿 Ramas (Branches)

| Comando | Explicación |
|---------|-------------|
| `git branch` | Lista las ramas locales |
| `git branch nueva-rama` | Crea una nueva rama |
| `git checkout rama` | Cambia a otra rama |
| `git checkout -b nueva-rama` | Crea y cambia a una nueva rama |
| `git merge rama` | Fusiona una rama con la actual |

## 🔧 Comandos Útiles

| Comando | Explicación |
|---------|-------------|
| `git reset HEAD archivo` | Quita un archivo del área de preparación |
| `git checkout -- archivo` | Descarta cambios en un archivo |
| `git commit --amend -m "nuevo mensaje"` | Corrige el último commit |
| `git stash` | Guarda cambios temporales sin commit |
| `git stash pop` | Recupera los cambios guardados |

## ⚠️ Comandos de Emergencia

| Comando | Explicación |
|---------|-------------|
| `git reset --soft HEAD~1` | Deshace el último commit (mantiene cambios) |
| `git reset --hard HEAD~1` | Deshace el último commit (borra cambios) |
| `git push -f origin main` | FUERZA la subida (usar con cuidado) |
| `git rebase -i HEAD~3` | Combina los últimos 3 commits |

## 📌 Flujo de Trabajo Diario

```bash
# 1. Ver qué cambió
git status

# 2. Agregar todos los cambios
git add .

# 3. Crear commit con mensaje descriptivo
git commit -m "descripción de lo que hice"

# 4. Subir a GitHub
git push