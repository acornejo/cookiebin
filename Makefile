all: docs lib

BUILD_DIR = build

lib:
	jshint src/cookiejar.js
	mkdir -p ${BUILD_DIR}/lib
	cp src/cookiejar.js ${BUILD_DIR}/lib/cookiejar.js
	closure --js ${BUILD_DIR}/lib/cookiejar.js --js_output_file ${BUILD_DIR}/lib/cookiejar.min.js

docs:
	mkdir -p ${BUILD_DIR}/docs
	jsdoc src/cookiejar.js -d=${BUILD_DIR}/docs

clean:
	rm -fR build
