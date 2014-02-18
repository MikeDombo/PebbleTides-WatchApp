#include <pebble.h>
#define MY_UUID { 0xE1, 0xC3, 0x71, 0x79, 0xCB, 0xF2, 0x42, 0x48, 0xA4, 0x50, 0xD6, 0x16, 0xA7, 0x09, 0x88, 0xD1 }

static Window *window;
static TextLayer *ZIP_layer;
static TextLayer *tide_layer;
static char ZIP[6];
static char tide[10];

enum {
  QUOTE_KEY_ZIP = 0x0,
  QUOTE_KEY_TIDE = 0x1,
  QUOTE_KEY_FETCH = 0x2,
};

static void set_ZIP_msg(char *ZIP) {
  Tuplet ZIP_tuple = TupletCString(QUOTE_KEY_ZIP, ZIP);

  DictionaryIterator *iter;
  app_message_outbox_begin(&iter);

  if (iter == NULL) {
    return;
  }

  dict_write_tuplet(iter, &ZIP_tuple);
  dict_write_end(iter);

  app_message_outbox_send();
}

static void fetch_msg(void) {
  Tuplet fetch_tuple = TupletInteger(QUOTE_KEY_FETCH, 1);
  Tuplet tide_tuple = TupletInteger(QUOTE_KEY_TIDE, 1);

  DictionaryIterator *iter;
  app_message_outbox_begin(&iter);

  if (iter == NULL) {
    return;
  }

  dict_write_tuplet(iter, &fetch_tuple);
  dict_write_tuplet(iter, &tide_tuple);
  dict_write_end(iter);

  app_message_outbox_send();
}

static void select_click_handler(ClickRecognizerRef recognizer, void *context) {
  // refresh
  text_layer_set_text(tide_layer, "Loading...");
  fetch_msg();
}

static void select_long_click_handler(ClickRecognizerRef recognizer, void *context) {
  // refresh
  //entry_get_name(ZIP, set_ZIP_msg);
  text_layer_set_text(ZIP_layer, ZIP);
  text_layer_set_text(tide_layer, "Loading...");
}

static void click_config_provider(void *context) {
  window_single_click_subscribe(BUTTON_ID_SELECT, select_click_handler);
  window_long_click_subscribe(BUTTON_ID_SELECT, 0, select_long_click_handler, NULL);
}

static void in_received_handler(DictionaryIterator *iter, void *context) {
  Tuple *ZIP_tuple = dict_find(iter, QUOTE_KEY_ZIP);
  Tuple *tide_tuple = dict_find(iter, QUOTE_KEY_TIDE);

  if (ZIP_tuple) {
    strncpy(ZIP, ZIP_tuple->value->cstring, 5);
    text_layer_set_text(ZIP_layer, ZIP);
  }
  if (tide_tuple) {
    strncpy(tide, tide_tuple->value->cstring, 10);
    text_layer_set_text(tide_layer, tide);
  }
}

static void in_dropped_handler(AppMessageResult reason, void *context) {
  APP_LOG(APP_LOG_LEVEL_DEBUG, "App Message Dropped!");
}

static void out_failed_handler(DictionaryIterator *failed, AppMessageResult reason, void *context) {
  APP_LOG(APP_LOG_LEVEL_DEBUG, "App Message Failed to Send!");
}

static void app_message_init(void) {
  // Register message handlers
  app_message_register_inbox_received(in_received_handler);
  app_message_register_inbox_dropped(in_dropped_handler);
  app_message_register_outbox_failed(out_failed_handler);
  // Init buffers
  app_message_open(64, 64);
  fetch_msg();
}

static void window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);

  ZIP_layer = text_layer_create(
      (GRect) { .origin = { 0, 20 }, .size = { bounds.size.w, 50 } });
  text_layer_set_text(ZIP_layer, "Wait"); text_layer_set_text_alignment(ZIP_layer, GTextAlignmentCenter); text_layer_set_font(ZIP_layer, fonts_get_system_font(FONT_KEY_BITHAM_42_BOLD));
  layer_add_child(window_layer, text_layer_get_layer(ZIP_layer));

  tide_layer = text_layer_create(
      (GRect) { .origin = { 0, 75 }, .size = { bounds.size.w, 50 } });
  text_layer_set_text(tide_layer, "tides go here");
  text_layer_set_text_alignment(tide_layer, GTextAlignmentCenter);
  text_layer_set_font(tide_layer, fonts_get_system_font(FONT_KEY_GOTHIC_28));
  layer_add_child(window_layer, text_layer_get_layer(tide_layer));

  fetch_msg();
}

static void window_unload(Window *window) {
  text_layer_destroy(ZIP_layer);
  text_layer_destroy(tide_layer);
}

static void init(void) {
  window = window_create();
  app_message_init();
  window_set_click_config_provider(window, click_config_provider);
  window_set_window_handlers(window, (WindowHandlers) {
    .load = window_load,
    .unload = window_unload,
  });
  const bool animated = true;
  window_stack_push(window, animated);
}

static void deinit(void) {
  window_destroy(window);
}

int main(void) {
  init();
  APP_LOG(APP_LOG_LEVEL_DEBUG, "Done initializing, pushed window: %p", window);
  app_event_loop();
  deinit();
}