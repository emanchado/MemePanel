EXTENSION_TARGET = meme-panel.oex
DIST_FILES = config.xml \
	     lib/*.js \
	     index.html popup.html css/*.css images/*

all:

dist: $(EXTENSION_TARGET)

$(EXTENSION_TARGET): $(DIST_FILES)
	zip -9r $(EXTENSION_TARGET) $(DIST_FILES)
