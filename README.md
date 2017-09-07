// dev enviroment tutorial version 1

// this set of command line instructions launched the website for me from a new ubuntu VM in virtualbox

step 1: Create ubuntu machine in Virtualbox or other (provision more than 10 gigs, some of these packages are pretty big)


git clone https://github.com/national-go-center/site

sudo apt-get install nodejs

sudo ln -s /usr/bin/nodejs /usr/bin/node

sudo apt-get install npm

sudo apt-get install mongodb-server

sudo npm install node-gyp -g

sudo npm install mimer -g

sudo npm install marked -g

cd site

npm install  --no-optional

(if fsevents error){
    rm -rf node_modules
    npm install
}

sudo npm install forever -g

sudo mkdir /data

sudo mkdir /data/db

cd node_modles/fast-feed

node-gyp configure

cd build

make

cd ../../..

Comment out cloudinary from models
    This step seems extreme but seems to nessecary according to Keystone devs
    ref - https://github.com/keystonejs/keystone/issues/582

npm keystone
