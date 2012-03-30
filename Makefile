all: docs lib

BUILD_DIR = build

lib:
	mkdir -p ${BUILD_DIR}/lib
	jshint src/cookiebin.js
	cp src/cookiebin.js ${BUILD_DIR}/lib/cookiebin.js
	uglifyjs -nc src/cookiebin.js > ${BUILD_DIR}/lib/cookiebin.min.js

docs: lib
	mkdir -p ${BUILD_DIR}/docs
	jsdoc src/cookiebin.js -d=${BUILD_DIR}/docs

clean:
	rm -fR build

.PHONY: docs
