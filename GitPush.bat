@echo off
echo Starting auto commit and push to git
git add .
git commit -m "Add Search"
git push
echo -----------------
echo -Task completed--
echo -----------------
pause
