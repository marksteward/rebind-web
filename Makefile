run:
	env/bin/python main.py

init:
	virtualenv env
	env/bin/pip install -r requirements.txt

update:
	env/bin/pip install -U -r requirements.txt
