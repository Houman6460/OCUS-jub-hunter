var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// lib/settings-storage.ts
var settings_storage_exports = {};
__export(settings_storage_exports, {
  SettingsStorage: () => SettingsStorage
});
var SettingsStorage;
var init_settings_storage = __esm({
  "lib/settings-storage.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    SettingsStorage = class {
      static {
        __name(this, "SettingsStorage");
      }
      db;
      constructor(database) {
        this.db = database;
      }
      async initializeSettings() {
        try {
          const result = await this.db.prepare(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run();
          console.log("Settings table initialized:", result);
        } catch (error) {
          console.error("Failed to initialize settings table:", error);
          throw error;
        }
      }
      async getSetting(key) {
        try {
          const result = await this.db.prepare(
            "SELECT value FROM settings WHERE key = ?"
          ).bind(key).first();
          return result ? result.value : null;
        } catch (error) {
          console.error("Failed to get setting:", error);
          return null;
        }
      }
      async setSetting(key, value) {
        try {
          console.log(`Setting ${key} with value length:`, value.length);
          const result = await this.db.prepare(
            "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)"
          ).bind(key, value).run();
          console.log(`Successfully set ${key}, result:`, result);
        } catch (error) {
          console.error(`Failed to set setting ${key}:`, error);
          throw error;
        }
      }
      async getChatSettings() {
        try {
          const openaiApiKey = await this.getSetting("openai_api_key");
          const assistantId = await this.getSetting("openai_assistant_id");
          const chatModel = await this.getSetting("chat_model") || "gpt-4o-mini";
          const enabled = await this.getSetting("chat_enabled") || "true";
          return {
            openaiApiKey: openaiApiKey ? "***hidden***" : "",
            assistantId: assistantId || "",
            chatModel,
            enabled: enabled === "true"
          };
        } catch (error) {
          console.error("Failed to get chat settings:", error);
          return {
            openaiApiKey: "",
            assistantId: "",
            chatModel: "gpt-4o-mini",
            enabled: true
          };
        }
      }
      async setChatSettings(settings) {
        try {
          if (settings.openaiApiKey && settings.openaiApiKey !== "***hidden***") {
            await this.setSetting("openai_api_key", settings.openaiApiKey);
          }
          if (settings.assistantId !== void 0) {
            await this.setSetting("openai_assistant_id", settings.assistantId || "");
          }
          if (settings.chatModel) {
            await this.setSetting("chat_model", settings.chatModel);
          }
          if (settings.enabled !== void 0) {
            await this.setSetting("chat_enabled", settings.enabled.toString());
          }
        } catch (error) {
          console.error("Failed to set chat settings:", error);
          console.error("Settings object:", settings);
          const message = error instanceof Error ? error.message : String(error);
          throw new Error(`Settings storage error: ${message}`);
        }
      }
      async getOpenAIApiKey() {
        return await this.getSetting("openai_api_key");
      }
    };
  }
});

// lib/translation-service.ts
var TranslationService;
var init_translation_service = __esm({
  "lib/translation-service.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    TranslationService = class {
      static {
        __name(this, "TranslationService");
      }
      static supportedLanguages = {
        en: "English",
        de: "German",
        fr: "French",
        es: "Spanish",
        it: "Italian",
        pt: "Portuguese",
        nl: "Dutch",
        da: "Danish",
        no: "Norwegian",
        fi: "Finnish",
        tr: "Turkish",
        pl: "Polish",
        ru: "Russian"
      };
      static async translateBadgeText(text, targetLanguages, openaiApiKey) {
        if (!openaiApiKey) {
          console.warn("OpenAI API key not provided - returning empty translation map");
          return {};
        }
        const validLanguages = targetLanguages.filter(
          (lang) => lang in this.supportedLanguages && lang !== "en"
        );
        if (validLanguages.length === 0) {
          return {};
        }
        const languageNames = validLanguages.map(
          (code) => `${code}: ${this.supportedLanguages[code]}`
        ).join(", ");
        const prompt = `Translate the following announcement badge text into multiple languages.

Original text (English): "${text}"
Context: Announcement badge for a Chrome extension product website
Target languages: ${languageNames}
Tone: Marketing/promotional tone

Requirements:
- Maintain the marketing/promotional tone
- Keep the same emotional impact as the original
- Adapt cultural nuances appropriately for each target market
- Keep translations concise and impactful for badge display
- Ensure translations sound natural to native speakers

Respond with a JSON object where keys are language codes (${validLanguages.join(", ")}) and values are the translated text.

Example format:
{
  "de": "German translation here",
  "fr": "French translation here"
}`;
        try {
          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${openaiApiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "gpt-4o",
              messages: [
                {
                  role: "system",
                  content: "You are a professional translator specializing in marketing and e-commerce content. Provide accurate, culturally appropriate translations that maintain the marketing impact of the original text."
                },
                {
                  role: "user",
                  content: prompt
                }
              ],
              response_format: { type: "json_object" },
              temperature: 0.3,
              max_tokens: 1e3
            })
          });
          if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
          }
          const data = await response.json();
          const translationText = data.choices[0]?.message?.content;
          if (!translationText) {
            throw new Error("No translation received from OpenAI");
          }
          const translations = JSON.parse(translationText);
          const result = {};
          for (const lang of validLanguages) {
            if (translations[lang] && typeof translations[lang] === "string") {
              result[lang] = translations[lang].trim();
            }
          }
          return result;
        } catch (error) {
          console.error("Translation service error:", error);
          throw new Error(`Translation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }
      static getSupportedLanguages() {
        return this.supportedLanguages;
      }
    };
  }
});

// api/admin/announcement-badges/translate.ts
var onRequestOptions, onRequestPost;
var init_translate = __esm({
  "api/admin/announcement-badges/translate.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    init_settings_storage();
    init_translation_service();
    onRequestOptions = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }, "onRequestOptions");
    onRequestPost = /* @__PURE__ */ __name(async (context) => {
      try {
        const requestData = await context.request.json();
        const { textEn, targetLanguages } = requestData;
        if (!textEn || !targetLanguages || !Array.isArray(targetLanguages)) {
          return new Response(JSON.stringify({
            error: "textEn and targetLanguages array are required"
          }), {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        let openaiApiKey = context.env.OPENAI_API_KEY;
        if (!openaiApiKey) {
          const settingsStorage = new SettingsStorage(context.env.DB);
          const apiKeySetting = await settingsStorage.getSetting("openai_api_key");
          openaiApiKey = apiKeySetting;
        }
        if (!openaiApiKey) {
          return new Response(JSON.stringify({
            error: "OpenAI API key not configured"
          }), {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        console.log("Translating badge text:", textEn, "to languages:", targetLanguages);
        const translations = await TranslationService.translateBadgeText(
          textEn,
          targetLanguages,
          openaiApiKey
        );
        console.log("Translation results:", translations);
        return new Response(JSON.stringify(translations), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Error translating badge text:", error);
        return new Response(JSON.stringify({
          error: "Failed to translate badge text",
          details: error instanceof Error ? error.message : "Unknown error"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestPost");
  }
});

// api/admin/announcement-badges/[id].ts
var onRequestOptions2, onRequestGet, onRequestPut, onRequestDelete;
var init_id = __esm({
  "api/admin/announcement-badges/[id].ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    init_settings_storage();
    onRequestOptions2 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }, "onRequestOptions");
    onRequestGet = /* @__PURE__ */ __name(async (context) => {
      try {
        const settingsStorage = new SettingsStorage(context.env.DB);
        const badgeId = context.params.id;
        if (!badgeId) {
          return new Response(JSON.stringify({ error: "Badge ID is required" }), {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        const badgesData = await settingsStorage.getSetting("announcement_badges");
        const badges = badgesData ? JSON.parse(badgesData) : [];
        const badge = badges.find((b) => b.id === badgeId);
        if (!badge) {
          return new Response(JSON.stringify({ error: "Badge not found" }), {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        return new Response(JSON.stringify(badge), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Error fetching announcement badge:", error);
        return new Response(JSON.stringify({
          error: "Failed to fetch announcement badge",
          details: error instanceof Error ? error.message : "Unknown error"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestGet");
    onRequestPut = /* @__PURE__ */ __name(async (context) => {
      try {
        const settingsStorage = new SettingsStorage(context.env.DB);
        const badgeId = context.params.id;
        const requestData = await context.request.json();
        if (!badgeId) {
          return new Response(JSON.stringify({ error: "Badge ID is required" }), {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        console.log("Updating announcement badge:", badgeId, JSON.stringify(requestData, null, 2));
        const existingBadgesData = await settingsStorage.getSetting("announcement_badges");
        const existingBadges = existingBadgesData ? JSON.parse(existingBadgesData) : [];
        const badgeIndex = existingBadges.findIndex((badge) => badge.id === badgeId);
        if (badgeIndex === -1) {
          return new Response(JSON.stringify({ error: "Badge not found" }), {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        existingBadges[badgeIndex] = {
          ...existingBadges[badgeIndex],
          title: requestData.title || requestData.text || requestData.badgeText || requestData.content || requestData.message || existingBadges[badgeIndex].title,
          subtitle: requestData.subtitle || existingBadges[badgeIndex].subtitle,
          backgroundColor: requestData.backgroundColor || requestData.bgColor || requestData.background || existingBadges[badgeIndex].backgroundColor,
          textColor: requestData.textColor || requestData.color || requestData.foreground || existingBadges[badgeIndex].textColor,
          priority: requestData.priority ? parseInt(requestData.priority) : existingBadges[badgeIndex].priority,
          isActive: requestData.isActive !== void 0 ? Boolean(requestData.isActive) : requestData.enabled !== void 0 ? Boolean(requestData.enabled) : existingBadges[badgeIndex].isActive,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        console.log("Updated badge object:", JSON.stringify(existingBadges[badgeIndex], null, 2));
        await settingsStorage.setSetting("announcement_badges", JSON.stringify(existingBadges));
        console.log("Updated announcement badge:", badgeId);
        return new Response(JSON.stringify(existingBadges[badgeIndex]), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Error updating announcement badge:", error);
        return new Response(JSON.stringify({
          error: "Failed to update announcement badge",
          details: error instanceof Error ? error.message : "Unknown error"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestPut");
    onRequestDelete = /* @__PURE__ */ __name(async (context) => {
      try {
        const settingsStorage = new SettingsStorage(context.env.DB);
        const badgeId = context.params.id;
        if (!badgeId) {
          return new Response(JSON.stringify({ error: "Badge ID is required" }), {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        console.log("Deleting announcement badge:", badgeId);
        const existingBadgesData = await settingsStorage.getSetting("announcement_badges");
        const existingBadges = existingBadgesData ? JSON.parse(existingBadgesData) : [];
        const updatedBadges = existingBadges.filter((badge) => badge.id !== badgeId);
        if (updatedBadges.length === existingBadges.length) {
          return new Response(JSON.stringify({ error: "Badge not found" }), {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        await settingsStorage.setSetting("announcement_badges", JSON.stringify(updatedBadges));
        console.log("Deleted announcement badge:", badgeId);
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Error deleting announcement badge:", error);
        return new Response(JSON.stringify({
          error: "Failed to delete announcement badge",
          details: error instanceof Error ? error.message : "Unknown error"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestDelete");
  }
});

// api/admin/countdown-banners/[id].ts
var onRequestOptions3, onRequestGet2, onRequestPut2, onRequestDelete2;
var init_id2 = __esm({
  "api/admin/countdown-banners/[id].ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    init_settings_storage();
    onRequestOptions3 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }, "onRequestOptions");
    onRequestGet2 = /* @__PURE__ */ __name(async (context) => {
      try {
        const settingsStorage = new SettingsStorage(context.env.DB);
        const bannerId = context.params.id;
        if (!bannerId) {
          return new Response(JSON.stringify({ error: "Banner ID is required" }), {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        const bannersData = await settingsStorage.getSetting("countdown_banners");
        const banners = bannersData ? JSON.parse(bannersData) : [];
        const banner = banners.find((b) => b.id === bannerId);
        if (!banner) {
          return new Response(JSON.stringify({ error: "Banner not found" }), {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        return new Response(JSON.stringify(banner), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Error fetching countdown banner:", error);
        return new Response(JSON.stringify({
          error: "Failed to fetch countdown banner",
          details: error instanceof Error ? error.message : "Unknown error"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestGet");
    onRequestPut2 = /* @__PURE__ */ __name(async (context) => {
      try {
        const settingsStorage = new SettingsStorage(context.env.DB);
        const bannerId = context.params.id;
        const requestData = await context.request.json();
        if (!bannerId) {
          return new Response(JSON.stringify({ error: "Banner ID is required" }), {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        console.log("Updating countdown banner:", bannerId, requestData);
        const existingBannersData = await settingsStorage.getSetting("countdown_banners");
        const existingBanners = existingBannersData ? JSON.parse(existingBannersData) : [];
        const bannerIndex = existingBanners.findIndex((banner) => banner.id === bannerId);
        if (bannerIndex === -1) {
          return new Response(JSON.stringify({ error: "Banner not found" }), {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        existingBanners[bannerIndex] = {
          ...existingBanners[bannerIndex],
          title: requestData.title || existingBanners[bannerIndex].title,
          subtitle: requestData.subtitle || existingBanners[bannerIndex].subtitle,
          targetPrice: requestData.targetPrice ? parseFloat(requestData.targetPrice) : existingBanners[bannerIndex].targetPrice,
          originalPrice: requestData.originalPrice ? parseFloat(requestData.originalPrice) : existingBanners[bannerIndex].originalPrice,
          endDate: requestData.endDate || existingBanners[bannerIndex].endDate,
          priority: requestData.priority ? parseInt(requestData.priority) : existingBanners[bannerIndex].priority,
          backgroundColor: requestData.backgroundColor || existingBanners[bannerIndex].backgroundColor,
          textColor: requestData.textColor || existingBanners[bannerIndex].textColor,
          isActive: requestData.isActive !== void 0 ? requestData.isActive : existingBanners[bannerIndex].isActive,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        await settingsStorage.setSetting("countdown_banners", JSON.stringify(existingBanners));
        console.log("Updated countdown banner:", bannerId);
        return new Response(JSON.stringify(existingBanners[bannerIndex]), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Error updating countdown banner:", error);
        return new Response(JSON.stringify({
          error: "Failed to update countdown banner",
          details: error instanceof Error ? error.message : "Unknown error"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestPut");
    onRequestDelete2 = /* @__PURE__ */ __name(async (context) => {
      try {
        const settingsStorage = new SettingsStorage(context.env.DB);
        const bannerId = context.params.id;
        if (!bannerId) {
          return new Response(JSON.stringify({ error: "Banner ID is required" }), {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        console.log("Deleting countdown banner:", bannerId);
        const existingBannersData = await settingsStorage.getSetting("countdown_banners");
        const existingBanners = existingBannersData ? JSON.parse(existingBannersData) : [];
        const updatedBanners = existingBanners.filter((banner) => banner.id !== bannerId);
        if (updatedBanners.length === existingBanners.length) {
          return new Response(JSON.stringify({ error: "Banner not found" }), {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        await settingsStorage.setSetting("countdown_banners", JSON.stringify(updatedBanners));
        console.log("Deleted countdown banner:", bannerId);
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Error deleting countdown banner:", error);
        return new Response(JSON.stringify({
          error: "Failed to delete countdown banner",
          details: error instanceof Error ? error.message : "Unknown error"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestDelete");
  }
});

// api/admin/dashboard-features/[feature].ts
var onRequestPut3, onRequestOptions4;
var init_feature = __esm({
  "api/admin/dashboard-features/[feature].ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    onRequestPut3 = /* @__PURE__ */ __name(async ({ request, params }) => {
      try {
        const featureName = params.feature;
        const { isEnabled, description } = await request.json();
        return new Response(JSON.stringify({
          success: true,
          message: `Feature ${featureName} updated successfully`,
          feature: {
            id: featureName,
            name: featureName.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
            isEnabled,
            description: description || `${featureName} feature`
          }
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          message: "Failed to update feature"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestPut");
    onRequestOptions4 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "PUT, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
  }
});

// api/admin/orders/[orderId].ts
async function onRequestPut4(context) {
  const { request, env, params } = context;
  const orderId = params.orderId;
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const { status } = await request.json();
    if (!status || !["pending", "completed", "failed", "refunded"].includes(status)) {
      return new Response(JSON.stringify({
        success: false,
        error: "Invalid status. Must be one of: pending, completed, failed, refunded"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
    const updateQuery = `
      UPDATE orders 
      SET status = ?, completedAt = ?
      WHERE id = ?
    `;
    const completedAt = status === "completed" ? (/* @__PURE__ */ new Date()).toISOString() : null;
    const updateResult = await env.DB.prepare(updateQuery).bind(status, completedAt, orderId).run();
    if (!updateResult.success) {
      throw new Error("Failed to update order status");
    }
    if (status === "completed") {
      const orderQuery = `
        SELECT customerEmail, finalAmount 
        FROM orders 
        WHERE id = ?
      `;
      const orderResult = await env.DB.prepare(orderQuery).bind(orderId).first();
      if (orderResult) {
        const userUpdateQuery = `
          UPDATE users 
          SET 
            isPremium = 1
          WHERE email = ?
        `;
        await env.DB.prepare(userUpdateQuery).bind(orderResult.customerEmail).run();
      }
    }
    return new Response(JSON.stringify({
      success: true,
      message: "Order status updated successfully"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to update order status"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
}
var init_orderId = __esm({
  "api/admin/orders/[orderId].ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    __name(onRequestPut4, "onRequestPut");
  }
});

// api/extension/check/[id].ts
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
var onRequestGet3;
var init_id3 = __esm({
  "api/extension/check/[id].ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    __name(json, "json");
    onRequestGet3 = /* @__PURE__ */ __name(async ({ request, params, env }) => {
      try {
        const paramId = params.id;
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return json({ canUse: false, reason: "Not authenticated" });
        }
        const token = authHeader.substring(7);
        if (token === "demo-jwt-token" && paramId === "1") {
          return json({
            canUse: true,
            reason: "Premium access",
            trialUsed: 0,
            isBlocked: false
          });
        }
        if (token.startsWith("jwt-token-")) {
          const userIdFromToken = parseInt(token.split("-")[2], 10);
          const userIdFromParam = parseInt(paramId, 10);
          if (isNaN(userIdFromToken) || isNaN(userIdFromParam) || userIdFromToken !== userIdFromParam) {
            return json({ canUse: false, reason: "Token mismatch" }, 403);
          }
          if (!env.DB) {
            return json({ canUse: false, reason: "Database not available" }, 500);
          }
          const customer = await env.DB.prepare(
            "SELECT extension_activated FROM customers WHERE id = ?"
          ).bind(userIdFromParam).first();
          if (customer && customer.extension_activated) {
            return json({
              canUse: true,
              reason: "Premium access",
              trialUsed: 0,
              isBlocked: false
            });
          } else {
            return json({
              canUse: true,
              reason: "Trial access",
              trialUsed: 5,
              // This could be dynamic in a real app
              isBlocked: false
            });
          }
        }
        return json({ canUse: false, reason: "Invalid token" }, 401);
      } catch (error) {
        return json({
          error: error.message
        }, 500);
      }
    }, "onRequestGet");
  }
});

// api/extension/downloads/[id].ts
function json2(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
var onRequestGet4;
var init_id4 = __esm({
  "api/extension/downloads/[id].ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    __name(json2, "json");
    onRequestGet4 = /* @__PURE__ */ __name(async ({ request, params, env }) => {
      try {
        const userId = params.id;
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return json2([]);
        }
        const token = authHeader.substring(7);
        if (token === "demo-jwt-token" || token.startsWith("jwt-token-") && token.split("-")[2] === "1") {
          return json2([
            {
              id: 1,
              downloadToken: "demo-download-token",
              downloadType: "paid",
              downloadCount: 1,
              createdAt: (/* @__PURE__ */ new Date()).toISOString()
            }
          ]);
        }
        return json2([]);
      } catch (error) {
        return json2({
          error: error.message
        }, 500);
      }
    }, "onRequestGet");
  }
});

// api/invoices/[id]/pdf.ts
var onRequestGet5, onRequestOptions5;
var init_pdf = __esm({
  "api/invoices/[id]/pdf.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    onRequestGet5 = /* @__PURE__ */ __name(async ({ params }) => {
      const invoiceId = params.id;
      const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Invoice #${invoiceId}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000125 00000 n 
0000000185 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
279
%%EOF`;
      return new Response(pdfContent, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="invoice-${invoiceId}.pdf"`,
          "Access-Control-Allow-Origin": "*"
        }
      });
    }, "onRequestGet");
    onRequestOptions5 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
  }
});

// lib/db.ts
var TicketStorage;
var init_db = __esm({
  "lib/db.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    TicketStorage = class {
      constructor(db) {
        this.db = db;
      }
      static {
        __name(this, "TicketStorage");
      }
      async getAllTickets() {
        try {
          const result = await this.db.prepare("SELECT * FROM tickets ORDER BY created_at DESC").all();
          return result.results;
        } catch (error) {
          console.error("D1 getAllTickets error:", error);
          throw new Error(`Database query failed: ${error.message}`);
        }
      }
      async getTicketsByCustomerEmail(email) {
        try {
          const result = await this.db.prepare("SELECT * FROM tickets WHERE customer_email = ? ORDER BY created_at DESC").bind(email).all();
          return result.results;
        } catch (error) {
          console.error("D1 getTicketsByCustomerEmail error:", error);
          throw new Error(`Database query failed: ${error.message}`);
        }
      }
      async getTicketsByCustomerId(customerId) {
        try {
          const result = await this.db.prepare("SELECT * FROM tickets WHERE customer_id = ? ORDER BY created_at DESC").bind(customerId).all();
          return result.results;
        } catch (error) {
          console.error("D1 getTicketsByCustomerId error:", error);
          throw new Error(`Database query failed: ${error.message}`);
        }
      }
      async getTicketById(id) {
        const result = await this.db.prepare("SELECT * FROM tickets WHERE id = ?").bind(id).first();
        return result;
      }
      async createTicket(ticket) {
        if (ticket.customer_id === void 0) {
          throw new Error("customer_id is required to create a ticket.");
        }
        const now = (/* @__PURE__ */ new Date()).toISOString();
        try {
          const result = await this.db.prepare(`
        INSERT INTO tickets (customer_id, title, description, category, priority, status, customer_email, customer_name, assigned_to_user_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING *
      `).bind(
            ticket.customer_id,
            ticket.title,
            ticket.description,
            ticket.category,
            ticket.priority,
            ticket.status,
            ticket.customer_email,
            ticket.customer_name,
            ticket.assigned_to_user_id || null,
            now,
            now
          ).first();
          if (!result) {
            throw new Error("Failed to insert ticket - no result returned");
          }
          return result;
        } catch (error) {
          console.error("D1 createTicket error:", error);
          throw new Error(`Database insert failed: ${error.message}`);
        }
      }
      async updateTicket(id, updates) {
        const now = (/* @__PURE__ */ new Date()).toISOString();
        try {
          const result = await this.db.prepare(`
        UPDATE tickets 
        SET title = COALESCE(?, title),
            description = COALESCE(?, description),
            category = COALESCE(?, category),
            priority = COALESCE(?, priority),
            status = COALESCE(?, status),
            assigned_to_user_id = COALESCE(?, assigned_to_user_id),
            updated_at = ?,
            resolved_at = CASE WHEN ? = 'resolved' THEN ? ELSE resolved_at END,
            archived_at = CASE WHEN ? = 'archived' THEN ? ELSE archived_at END
        WHERE id = ?
        RETURNING *
      `).bind(
            updates.title || null,
            updates.description || null,
            updates.category || null,
            updates.priority || null,
            updates.status || null,
            updates.assigned_to_user_id || null,
            now,
            updates.status,
            updates.status === "resolved" ? now : null,
            updates.status,
            updates.status === "archived" ? now : null,
            id
          ).first();
          return result;
        } catch (error) {
          console.error("D1 updateTicket error:", error);
          throw new Error(`Database update failed: ${error.message}`);
        }
      }
      async archiveTicket(id) {
        const now = (/* @__PURE__ */ new Date()).toISOString();
        try {
          const result = await this.db.prepare(`
        UPDATE tickets 
        SET status = 'archived',
            archived_at = ?,
            updated_at = ?
        WHERE id = ?
        RETURNING *
      `).bind(now, now, id).first();
          return result;
        } catch (error) {
          console.error("D1 archiveTicket error:", error);
          throw new Error(`Database archive failed: ${error.message}`);
        }
      }
      async updateTicketStatus(id, status) {
        const now = (/* @__PURE__ */ new Date()).toISOString();
        await this.db.prepare("UPDATE tickets SET status = ?, updated_at = ? WHERE id = ?").bind(status, now, id).run();
      }
      async deleteTicket(id) {
        await this.db.prepare("DELETE FROM ticket_messages WHERE ticket_id = ?").bind(id).run();
        await this.db.prepare("DELETE FROM tickets WHERE id = ?").bind(id).run();
      }
      async getTicketMessages(ticketId) {
        const result = await this.db.prepare("SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC").bind(ticketId).all();
        return result.results;
      }
      async addTicketMessage(message) {
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const result = await this.db.prepare(`
      INSERT INTO ticket_messages (ticket_id, message, is_from_customer, sender_name, sender_email, created_at, attachments)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
          message.ticket_id,
          message.message,
          message.is_from_customer ? 1 : 0,
          message.sender_name,
          message.sender_email || null,
          now,
          message.attachments || null
        ).first();
        await this.db.prepare("UPDATE tickets SET updated_at = ? WHERE id = ?").bind(now, message.ticket_id).run();
        return result;
      }
    };
  }
});

// api/tickets/[id]/archive.ts
var onRequestPost2;
var init_archive = __esm({
  "api/tickets/[id]/archive.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    init_db();
    onRequestPost2 = /* @__PURE__ */ __name(async ({ request, params, env }) => {
      const ticketId = Number(params.id);
      if (!ticketId || isNaN(ticketId)) {
        return Response.json({ success: false, message: "Invalid ticket ID" }, { status: 400 });
      }
      if (env.EXPRESS_API_BASE) {
        try {
          const proxyUrl = `${env.EXPRESS_API_BASE}/api/tickets/${ticketId}/archive`;
          const proxyResponse = await fetch(proxyUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": request.headers.get("Authorization") || ""
            }
          });
          const data = await proxyResponse.json();
          return Response.json(data, { status: proxyResponse.status });
        } catch (error) {
          console.error("Express proxy error:", error);
        }
      }
      if (!env.DB) {
        return Response.json({ success: false, message: "Database not available" }, { status: 500 });
      }
      try {
        const storage = new TicketStorage(env.DB);
        const existingTicket = await storage.getTicketById(ticketId);
        if (!existingTicket) {
          return Response.json({ success: false, message: "Ticket not found" }, { status: 404 });
        }
        const archivedTicket = await storage.archiveTicket(ticketId);
        if (!archivedTicket) {
          return Response.json({ success: false, message: "Failed to archive ticket" }, { status: 500 });
        }
        return Response.json({
          success: true,
          message: "Ticket archived successfully",
          ticket: archivedTicket
        });
      } catch (error) {
        console.error("Archive ticket error:", error);
        return Response.json({
          success: false,
          message: "Failed to archive ticket",
          error: error.message
        }, { status: 500 });
      }
    }, "onRequestPost");
  }
});

// (disabled):crypto
var require_crypto = __commonJS({
  "(disabled):crypto"() {
    init_functionsRoutes_0_0036357540446472214();
  }
});

// ../node_modules/bcryptjs/index.js
var bcryptjs_exports = {};
__export(bcryptjs_exports, {
  compare: () => compare,
  compareSync: () => compareSync,
  decodeBase64: () => decodeBase64,
  default: () => bcryptjs_default,
  encodeBase64: () => encodeBase64,
  genSalt: () => genSalt,
  genSaltSync: () => genSaltSync,
  getRounds: () => getRounds,
  getSalt: () => getSalt,
  hash: () => hash,
  hashSync: () => hashSync,
  setRandomFallback: () => setRandomFallback,
  truncates: () => truncates
});
function randomBytes(len) {
  try {
    return crypto.getRandomValues(new Uint8Array(len));
  } catch {
  }
  try {
    return import_crypto.default.randomBytes(len);
  } catch {
  }
  if (!randomFallback) {
    throw Error(
      "Neither WebCryptoAPI nor a crypto module is available. Use bcrypt.setRandomFallback to set an alternative"
    );
  }
  return randomFallback(len);
}
function setRandomFallback(random) {
  randomFallback = random;
}
function genSaltSync(rounds, seed_length) {
  rounds = rounds || GENSALT_DEFAULT_LOG2_ROUNDS;
  if (typeof rounds !== "number")
    throw Error(
      "Illegal arguments: " + typeof rounds + ", " + typeof seed_length
    );
  if (rounds < 4) rounds = 4;
  else if (rounds > 31) rounds = 31;
  var salt = [];
  salt.push("$2b$");
  if (rounds < 10) salt.push("0");
  salt.push(rounds.toString());
  salt.push("$");
  salt.push(base64_encode(randomBytes(BCRYPT_SALT_LEN), BCRYPT_SALT_LEN));
  return salt.join("");
}
function genSalt(rounds, seed_length, callback) {
  if (typeof seed_length === "function")
    callback = seed_length, seed_length = void 0;
  if (typeof rounds === "function") callback = rounds, rounds = void 0;
  if (typeof rounds === "undefined") rounds = GENSALT_DEFAULT_LOG2_ROUNDS;
  else if (typeof rounds !== "number")
    throw Error("illegal arguments: " + typeof rounds);
  function _async(callback2) {
    nextTick(function() {
      try {
        callback2(null, genSaltSync(rounds));
      } catch (err) {
        callback2(err);
      }
    });
  }
  __name(_async, "_async");
  if (callback) {
    if (typeof callback !== "function")
      throw Error("Illegal callback: " + typeof callback);
    _async(callback);
  } else
    return new Promise(function(resolve, reject) {
      _async(function(err, res) {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });
}
function hashSync(password, salt) {
  if (typeof salt === "undefined") salt = GENSALT_DEFAULT_LOG2_ROUNDS;
  if (typeof salt === "number") salt = genSaltSync(salt);
  if (typeof password !== "string" || typeof salt !== "string")
    throw Error("Illegal arguments: " + typeof password + ", " + typeof salt);
  return _hash(password, salt);
}
function hash(password, salt, callback, progressCallback) {
  function _async(callback2) {
    if (typeof password === "string" && typeof salt === "number")
      genSalt(salt, function(err, salt2) {
        _hash(password, salt2, callback2, progressCallback);
      });
    else if (typeof password === "string" && typeof salt === "string")
      _hash(password, salt, callback2, progressCallback);
    else
      nextTick(
        callback2.bind(
          this,
          Error("Illegal arguments: " + typeof password + ", " + typeof salt)
        )
      );
  }
  __name(_async, "_async");
  if (callback) {
    if (typeof callback !== "function")
      throw Error("Illegal callback: " + typeof callback);
    _async(callback);
  } else
    return new Promise(function(resolve, reject) {
      _async(function(err, res) {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });
}
function safeStringCompare(known, unknown) {
  var diff = known.length ^ unknown.length;
  for (var i = 0; i < known.length; ++i) {
    diff |= known.charCodeAt(i) ^ unknown.charCodeAt(i);
  }
  return diff === 0;
}
function compareSync(password, hash2) {
  if (typeof password !== "string" || typeof hash2 !== "string")
    throw Error("Illegal arguments: " + typeof password + ", " + typeof hash2);
  if (hash2.length !== 60) return false;
  return safeStringCompare(
    hashSync(password, hash2.substring(0, hash2.length - 31)),
    hash2
  );
}
function compare(password, hashValue, callback, progressCallback) {
  function _async(callback2) {
    if (typeof password !== "string" || typeof hashValue !== "string") {
      nextTick(
        callback2.bind(
          this,
          Error(
            "Illegal arguments: " + typeof password + ", " + typeof hashValue
          )
        )
      );
      return;
    }
    if (hashValue.length !== 60) {
      nextTick(callback2.bind(this, null, false));
      return;
    }
    hash(
      password,
      hashValue.substring(0, 29),
      function(err, comp) {
        if (err) callback2(err);
        else callback2(null, safeStringCompare(comp, hashValue));
      },
      progressCallback
    );
  }
  __name(_async, "_async");
  if (callback) {
    if (typeof callback !== "function")
      throw Error("Illegal callback: " + typeof callback);
    _async(callback);
  } else
    return new Promise(function(resolve, reject) {
      _async(function(err, res) {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });
}
function getRounds(hash2) {
  if (typeof hash2 !== "string")
    throw Error("Illegal arguments: " + typeof hash2);
  return parseInt(hash2.split("$")[2], 10);
}
function getSalt(hash2) {
  if (typeof hash2 !== "string")
    throw Error("Illegal arguments: " + typeof hash2);
  if (hash2.length !== 60)
    throw Error("Illegal hash length: " + hash2.length + " != 60");
  return hash2.substring(0, 29);
}
function truncates(password) {
  if (typeof password !== "string")
    throw Error("Illegal arguments: " + typeof password);
  return utf8Length(password) > 72;
}
function utf8Length(string) {
  var len = 0, c = 0;
  for (var i = 0; i < string.length; ++i) {
    c = string.charCodeAt(i);
    if (c < 128) len += 1;
    else if (c < 2048) len += 2;
    else if ((c & 64512) === 55296 && (string.charCodeAt(i + 1) & 64512) === 56320) {
      ++i;
      len += 4;
    } else len += 3;
  }
  return len;
}
function utf8Array(string) {
  var offset = 0, c1, c2;
  var buffer = new Array(utf8Length(string));
  for (var i = 0, k = string.length; i < k; ++i) {
    c1 = string.charCodeAt(i);
    if (c1 < 128) {
      buffer[offset++] = c1;
    } else if (c1 < 2048) {
      buffer[offset++] = c1 >> 6 | 192;
      buffer[offset++] = c1 & 63 | 128;
    } else if ((c1 & 64512) === 55296 && ((c2 = string.charCodeAt(i + 1)) & 64512) === 56320) {
      c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
      ++i;
      buffer[offset++] = c1 >> 18 | 240;
      buffer[offset++] = c1 >> 12 & 63 | 128;
      buffer[offset++] = c1 >> 6 & 63 | 128;
      buffer[offset++] = c1 & 63 | 128;
    } else {
      buffer[offset++] = c1 >> 12 | 224;
      buffer[offset++] = c1 >> 6 & 63 | 128;
      buffer[offset++] = c1 & 63 | 128;
    }
  }
  return buffer;
}
function base64_encode(b, len) {
  var off = 0, rs = [], c1, c2;
  if (len <= 0 || len > b.length) throw Error("Illegal len: " + len);
  while (off < len) {
    c1 = b[off++] & 255;
    rs.push(BASE64_CODE[c1 >> 2 & 63]);
    c1 = (c1 & 3) << 4;
    if (off >= len) {
      rs.push(BASE64_CODE[c1 & 63]);
      break;
    }
    c2 = b[off++] & 255;
    c1 |= c2 >> 4 & 15;
    rs.push(BASE64_CODE[c1 & 63]);
    c1 = (c2 & 15) << 2;
    if (off >= len) {
      rs.push(BASE64_CODE[c1 & 63]);
      break;
    }
    c2 = b[off++] & 255;
    c1 |= c2 >> 6 & 3;
    rs.push(BASE64_CODE[c1 & 63]);
    rs.push(BASE64_CODE[c2 & 63]);
  }
  return rs.join("");
}
function base64_decode(s, len) {
  var off = 0, slen = s.length, olen = 0, rs = [], c1, c2, c3, c4, o, code;
  if (len <= 0) throw Error("Illegal len: " + len);
  while (off < slen - 1 && olen < len) {
    code = s.charCodeAt(off++);
    c1 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    code = s.charCodeAt(off++);
    c2 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    if (c1 == -1 || c2 == -1) break;
    o = c1 << 2 >>> 0;
    o |= (c2 & 48) >> 4;
    rs.push(String.fromCharCode(o));
    if (++olen >= len || off >= slen) break;
    code = s.charCodeAt(off++);
    c3 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    if (c3 == -1) break;
    o = (c2 & 15) << 4 >>> 0;
    o |= (c3 & 60) >> 2;
    rs.push(String.fromCharCode(o));
    if (++olen >= len || off >= slen) break;
    code = s.charCodeAt(off++);
    c4 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    o = (c3 & 3) << 6 >>> 0;
    o |= c4;
    rs.push(String.fromCharCode(o));
    ++olen;
  }
  var res = [];
  for (off = 0; off < olen; off++) res.push(rs[off].charCodeAt(0));
  return res;
}
function _encipher(lr, off, P, S) {
  var n, l = lr[off], r = lr[off + 1];
  l ^= P[0];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[1];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[2];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[3];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[4];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[5];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[6];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[7];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[8];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[9];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[10];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[11];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[12];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[13];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[14];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[15];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[16];
  lr[off] = r ^ P[BLOWFISH_NUM_ROUNDS + 1];
  lr[off + 1] = l;
  return lr;
}
function _streamtoword(data, offp) {
  for (var i = 0, word = 0; i < 4; ++i)
    word = word << 8 | data[offp] & 255, offp = (offp + 1) % data.length;
  return { key: word, offp };
}
function _key(key, P, S) {
  var offset = 0, lr = [0, 0], plen = P.length, slen = S.length, sw;
  for (var i = 0; i < plen; i++)
    sw = _streamtoword(key, offset), offset = sw.offp, P[i] = P[i] ^ sw.key;
  for (i = 0; i < plen; i += 2)
    lr = _encipher(lr, 0, P, S), P[i] = lr[0], P[i + 1] = lr[1];
  for (i = 0; i < slen; i += 2)
    lr = _encipher(lr, 0, P, S), S[i] = lr[0], S[i + 1] = lr[1];
}
function _ekskey(data, key, P, S) {
  var offp = 0, lr = [0, 0], plen = P.length, slen = S.length, sw;
  for (var i = 0; i < plen; i++)
    sw = _streamtoword(key, offp), offp = sw.offp, P[i] = P[i] ^ sw.key;
  offp = 0;
  for (i = 0; i < plen; i += 2)
    sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P, S), P[i] = lr[0], P[i + 1] = lr[1];
  for (i = 0; i < slen; i += 2)
    sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P, S), S[i] = lr[0], S[i + 1] = lr[1];
}
function _crypt(b, salt, rounds, callback, progressCallback) {
  var cdata = C_ORIG.slice(), clen = cdata.length, err;
  if (rounds < 4 || rounds > 31) {
    err = Error("Illegal number of rounds (4-31): " + rounds);
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  if (salt.length !== BCRYPT_SALT_LEN) {
    err = Error(
      "Illegal salt length: " + salt.length + " != " + BCRYPT_SALT_LEN
    );
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  rounds = 1 << rounds >>> 0;
  var P, S, i = 0, j;
  if (typeof Int32Array === "function") {
    P = new Int32Array(P_ORIG);
    S = new Int32Array(S_ORIG);
  } else {
    P = P_ORIG.slice();
    S = S_ORIG.slice();
  }
  _ekskey(salt, b, P, S);
  function next() {
    if (progressCallback) progressCallback(i / rounds);
    if (i < rounds) {
      var start = Date.now();
      for (; i < rounds; ) {
        i = i + 1;
        _key(b, P, S);
        _key(salt, P, S);
        if (Date.now() - start > MAX_EXECUTION_TIME) break;
      }
    } else {
      for (i = 0; i < 64; i++)
        for (j = 0; j < clen >> 1; j++) _encipher(cdata, j << 1, P, S);
      var ret = [];
      for (i = 0; i < clen; i++)
        ret.push((cdata[i] >> 24 & 255) >>> 0), ret.push((cdata[i] >> 16 & 255) >>> 0), ret.push((cdata[i] >> 8 & 255) >>> 0), ret.push((cdata[i] & 255) >>> 0);
      if (callback) {
        callback(null, ret);
        return;
      } else return ret;
    }
    if (callback) nextTick(next);
  }
  __name(next, "next");
  if (typeof callback !== "undefined") {
    next();
  } else {
    var res;
    while (true) if (typeof (res = next()) !== "undefined") return res || [];
  }
}
function _hash(password, salt, callback, progressCallback) {
  var err;
  if (typeof password !== "string" || typeof salt !== "string") {
    err = Error("Invalid string / salt: Not a string");
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  var minor, offset;
  if (salt.charAt(0) !== "$" || salt.charAt(1) !== "2") {
    err = Error("Invalid salt version: " + salt.substring(0, 2));
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  if (salt.charAt(2) === "$") minor = String.fromCharCode(0), offset = 3;
  else {
    minor = salt.charAt(2);
    if (minor !== "a" && minor !== "b" && minor !== "y" || salt.charAt(3) !== "$") {
      err = Error("Invalid salt revision: " + salt.substring(2, 4));
      if (callback) {
        nextTick(callback.bind(this, err));
        return;
      } else throw err;
    }
    offset = 4;
  }
  if (salt.charAt(offset + 2) > "$") {
    err = Error("Missing salt rounds");
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  var r1 = parseInt(salt.substring(offset, offset + 1), 10) * 10, r2 = parseInt(salt.substring(offset + 1, offset + 2), 10), rounds = r1 + r2, real_salt = salt.substring(offset + 3, offset + 25);
  password += minor >= "a" ? "\0" : "";
  var passwordb = utf8Array(password), saltb = base64_decode(real_salt, BCRYPT_SALT_LEN);
  function finish(bytes) {
    var res = [];
    res.push("$2");
    if (minor >= "a") res.push(minor);
    res.push("$");
    if (rounds < 10) res.push("0");
    res.push(rounds.toString());
    res.push("$");
    res.push(base64_encode(saltb, saltb.length));
    res.push(base64_encode(bytes, C_ORIG.length * 4 - 1));
    return res.join("");
  }
  __name(finish, "finish");
  if (typeof callback == "undefined")
    return finish(_crypt(passwordb, saltb, rounds));
  else {
    _crypt(
      passwordb,
      saltb,
      rounds,
      function(err2, bytes) {
        if (err2) callback(err2, null);
        else callback(null, finish(bytes));
      },
      progressCallback
    );
  }
}
function encodeBase64(bytes, length) {
  return base64_encode(bytes, length);
}
function decodeBase64(string, length) {
  return base64_decode(string, length);
}
var import_crypto, randomFallback, nextTick, BASE64_CODE, BASE64_INDEX, BCRYPT_SALT_LEN, GENSALT_DEFAULT_LOG2_ROUNDS, BLOWFISH_NUM_ROUNDS, MAX_EXECUTION_TIME, P_ORIG, S_ORIG, C_ORIG, bcryptjs_default;
var init_bcryptjs = __esm({
  "../node_modules/bcryptjs/index.js"() {
    init_functionsRoutes_0_0036357540446472214();
    import_crypto = __toESM(require_crypto(), 1);
    randomFallback = null;
    __name(randomBytes, "randomBytes");
    __name(setRandomFallback, "setRandomFallback");
    __name(genSaltSync, "genSaltSync");
    __name(genSalt, "genSalt");
    __name(hashSync, "hashSync");
    __name(hash, "hash");
    __name(safeStringCompare, "safeStringCompare");
    __name(compareSync, "compareSync");
    __name(compare, "compare");
    __name(getRounds, "getRounds");
    __name(getSalt, "getSalt");
    __name(truncates, "truncates");
    nextTick = typeof process !== "undefined" && process && typeof process.nextTick === "function" ? typeof setImmediate === "function" ? setImmediate : process.nextTick : setTimeout;
    __name(utf8Length, "utf8Length");
    __name(utf8Array, "utf8Array");
    BASE64_CODE = "./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("");
    BASE64_INDEX = [
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      0,
      1,
      54,
      55,
      56,
      57,
      58,
      59,
      60,
      61,
      62,
      63,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      26,
      27,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      28,
      29,
      30,
      31,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
      39,
      40,
      41,
      42,
      43,
      44,
      45,
      46,
      47,
      48,
      49,
      50,
      51,
      52,
      53,
      -1,
      -1,
      -1,
      -1,
      -1
    ];
    __name(base64_encode, "base64_encode");
    __name(base64_decode, "base64_decode");
    BCRYPT_SALT_LEN = 16;
    GENSALT_DEFAULT_LOG2_ROUNDS = 10;
    BLOWFISH_NUM_ROUNDS = 16;
    MAX_EXECUTION_TIME = 100;
    P_ORIG = [
      608135816,
      2242054355,
      320440878,
      57701188,
      2752067618,
      698298832,
      137296536,
      3964562569,
      1160258022,
      953160567,
      3193202383,
      887688300,
      3232508343,
      3380367581,
      1065670069,
      3041331479,
      2450970073,
      2306472731
    ];
    S_ORIG = [
      3509652390,
      2564797868,
      805139163,
      3491422135,
      3101798381,
      1780907670,
      3128725573,
      4046225305,
      614570311,
      3012652279,
      134345442,
      2240740374,
      1667834072,
      1901547113,
      2757295779,
      4103290238,
      227898511,
      1921955416,
      1904987480,
      2182433518,
      2069144605,
      3260701109,
      2620446009,
      720527379,
      3318853667,
      677414384,
      3393288472,
      3101374703,
      2390351024,
      1614419982,
      1822297739,
      2954791486,
      3608508353,
      3174124327,
      2024746970,
      1432378464,
      3864339955,
      2857741204,
      1464375394,
      1676153920,
      1439316330,
      715854006,
      3033291828,
      289532110,
      2706671279,
      2087905683,
      3018724369,
      1668267050,
      732546397,
      1947742710,
      3462151702,
      2609353502,
      2950085171,
      1814351708,
      2050118529,
      680887927,
      999245976,
      1800124847,
      3300911131,
      1713906067,
      1641548236,
      4213287313,
      1216130144,
      1575780402,
      4018429277,
      3917837745,
      3693486850,
      3949271944,
      596196993,
      3549867205,
      258830323,
      2213823033,
      772490370,
      2760122372,
      1774776394,
      2652871518,
      566650946,
      4142492826,
      1728879713,
      2882767088,
      1783734482,
      3629395816,
      2517608232,
      2874225571,
      1861159788,
      326777828,
      3124490320,
      2130389656,
      2716951837,
      967770486,
      1724537150,
      2185432712,
      2364442137,
      1164943284,
      2105845187,
      998989502,
      3765401048,
      2244026483,
      1075463327,
      1455516326,
      1322494562,
      910128902,
      469688178,
      1117454909,
      936433444,
      3490320968,
      3675253459,
      1240580251,
      122909385,
      2157517691,
      634681816,
      4142456567,
      3825094682,
      3061402683,
      2540495037,
      79693498,
      3249098678,
      1084186820,
      1583128258,
      426386531,
      1761308591,
      1047286709,
      322548459,
      995290223,
      1845252383,
      2603652396,
      3431023940,
      2942221577,
      3202600964,
      3727903485,
      1712269319,
      422464435,
      3234572375,
      1170764815,
      3523960633,
      3117677531,
      1434042557,
      442511882,
      3600875718,
      1076654713,
      1738483198,
      4213154764,
      2393238008,
      3677496056,
      1014306527,
      4251020053,
      793779912,
      2902807211,
      842905082,
      4246964064,
      1395751752,
      1040244610,
      2656851899,
      3396308128,
      445077038,
      3742853595,
      3577915638,
      679411651,
      2892444358,
      2354009459,
      1767581616,
      3150600392,
      3791627101,
      3102740896,
      284835224,
      4246832056,
      1258075500,
      768725851,
      2589189241,
      3069724005,
      3532540348,
      1274779536,
      3789419226,
      2764799539,
      1660621633,
      3471099624,
      4011903706,
      913787905,
      3497959166,
      737222580,
      2514213453,
      2928710040,
      3937242737,
      1804850592,
      3499020752,
      2949064160,
      2386320175,
      2390070455,
      2415321851,
      4061277028,
      2290661394,
      2416832540,
      1336762016,
      1754252060,
      3520065937,
      3014181293,
      791618072,
      3188594551,
      3933548030,
      2332172193,
      3852520463,
      3043980520,
      413987798,
      3465142937,
      3030929376,
      4245938359,
      2093235073,
      3534596313,
      375366246,
      2157278981,
      2479649556,
      555357303,
      3870105701,
      2008414854,
      3344188149,
      4221384143,
      3956125452,
      2067696032,
      3594591187,
      2921233993,
      2428461,
      544322398,
      577241275,
      1471733935,
      610547355,
      4027169054,
      1432588573,
      1507829418,
      2025931657,
      3646575487,
      545086370,
      48609733,
      2200306550,
      1653985193,
      298326376,
      1316178497,
      3007786442,
      2064951626,
      458293330,
      2589141269,
      3591329599,
      3164325604,
      727753846,
      2179363840,
      146436021,
      1461446943,
      4069977195,
      705550613,
      3059967265,
      3887724982,
      4281599278,
      3313849956,
      1404054877,
      2845806497,
      146425753,
      1854211946,
      1266315497,
      3048417604,
      3681880366,
      3289982499,
      290971e4,
      1235738493,
      2632868024,
      2414719590,
      3970600049,
      1771706367,
      1449415276,
      3266420449,
      422970021,
      1963543593,
      2690192192,
      3826793022,
      1062508698,
      1531092325,
      1804592342,
      2583117782,
      2714934279,
      4024971509,
      1294809318,
      4028980673,
      1289560198,
      2221992742,
      1669523910,
      35572830,
      157838143,
      1052438473,
      1016535060,
      1802137761,
      1753167236,
      1386275462,
      3080475397,
      2857371447,
      1040679964,
      2145300060,
      2390574316,
      1461121720,
      2956646967,
      4031777805,
      4028374788,
      33600511,
      2920084762,
      1018524850,
      629373528,
      3691585981,
      3515945977,
      2091462646,
      2486323059,
      586499841,
      988145025,
      935516892,
      3367335476,
      2599673255,
      2839830854,
      265290510,
      3972581182,
      2759138881,
      3795373465,
      1005194799,
      847297441,
      406762289,
      1314163512,
      1332590856,
      1866599683,
      4127851711,
      750260880,
      613907577,
      1450815602,
      3165620655,
      3734664991,
      3650291728,
      3012275730,
      3704569646,
      1427272223,
      778793252,
      1343938022,
      2676280711,
      2052605720,
      1946737175,
      3164576444,
      3914038668,
      3967478842,
      3682934266,
      1661551462,
      3294938066,
      4011595847,
      840292616,
      3712170807,
      616741398,
      312560963,
      711312465,
      1351876610,
      322626781,
      1910503582,
      271666773,
      2175563734,
      1594956187,
      70604529,
      3617834859,
      1007753275,
      1495573769,
      4069517037,
      2549218298,
      2663038764,
      504708206,
      2263041392,
      3941167025,
      2249088522,
      1514023603,
      1998579484,
      1312622330,
      694541497,
      2582060303,
      2151582166,
      1382467621,
      776784248,
      2618340202,
      3323268794,
      2497899128,
      2784771155,
      503983604,
      4076293799,
      907881277,
      423175695,
      432175456,
      1378068232,
      4145222326,
      3954048622,
      3938656102,
      3820766613,
      2793130115,
      2977904593,
      26017576,
      3274890735,
      3194772133,
      1700274565,
      1756076034,
      4006520079,
      3677328699,
      720338349,
      1533947780,
      354530856,
      688349552,
      3973924725,
      1637815568,
      332179504,
      3949051286,
      53804574,
      2852348879,
      3044236432,
      1282449977,
      3583942155,
      3416972820,
      4006381244,
      1617046695,
      2628476075,
      3002303598,
      1686838959,
      431878346,
      2686675385,
      1700445008,
      1080580658,
      1009431731,
      832498133,
      3223435511,
      2605976345,
      2271191193,
      2516031870,
      1648197032,
      4164389018,
      2548247927,
      300782431,
      375919233,
      238389289,
      3353747414,
      2531188641,
      2019080857,
      1475708069,
      455242339,
      2609103871,
      448939670,
      3451063019,
      1395535956,
      2413381860,
      1841049896,
      1491858159,
      885456874,
      4264095073,
      4001119347,
      1565136089,
      3898914787,
      1108368660,
      540939232,
      1173283510,
      2745871338,
      3681308437,
      4207628240,
      3343053890,
      4016749493,
      1699691293,
      1103962373,
      3625875870,
      2256883143,
      3830138730,
      1031889488,
      3479347698,
      1535977030,
      4236805024,
      3251091107,
      2132092099,
      1774941330,
      1199868427,
      1452454533,
      157007616,
      2904115357,
      342012276,
      595725824,
      1480756522,
      206960106,
      497939518,
      591360097,
      863170706,
      2375253569,
      3596610801,
      1814182875,
      2094937945,
      3421402208,
      1082520231,
      3463918190,
      2785509508,
      435703966,
      3908032597,
      1641649973,
      2842273706,
      3305899714,
      1510255612,
      2148256476,
      2655287854,
      3276092548,
      4258621189,
      236887753,
      3681803219,
      274041037,
      1734335097,
      3815195456,
      3317970021,
      1899903192,
      1026095262,
      4050517792,
      356393447,
      2410691914,
      3873677099,
      3682840055,
      3913112168,
      2491498743,
      4132185628,
      2489919796,
      1091903735,
      1979897079,
      3170134830,
      3567386728,
      3557303409,
      857797738,
      1136121015,
      1342202287,
      507115054,
      2535736646,
      337727348,
      3213592640,
      1301675037,
      2528481711,
      1895095763,
      1721773893,
      3216771564,
      62756741,
      2142006736,
      835421444,
      2531993523,
      1442658625,
      3659876326,
      2882144922,
      676362277,
      1392781812,
      170690266,
      3921047035,
      1759253602,
      3611846912,
      1745797284,
      664899054,
      1329594018,
      3901205900,
      3045908486,
      2062866102,
      2865634940,
      3543621612,
      3464012697,
      1080764994,
      553557557,
      3656615353,
      3996768171,
      991055499,
      499776247,
      1265440854,
      648242737,
      3940784050,
      980351604,
      3713745714,
      1749149687,
      3396870395,
      4211799374,
      3640570775,
      1161844396,
      3125318951,
      1431517754,
      545492359,
      4268468663,
      3499529547,
      1437099964,
      2702547544,
      3433638243,
      2581715763,
      2787789398,
      1060185593,
      1593081372,
      2418618748,
      4260947970,
      69676912,
      2159744348,
      86519011,
      2512459080,
      3838209314,
      1220612927,
      3339683548,
      133810670,
      1090789135,
      1078426020,
      1569222167,
      845107691,
      3583754449,
      4072456591,
      1091646820,
      628848692,
      1613405280,
      3757631651,
      526609435,
      236106946,
      48312990,
      2942717905,
      3402727701,
      1797494240,
      859738849,
      992217954,
      4005476642,
      2243076622,
      3870952857,
      3732016268,
      765654824,
      3490871365,
      2511836413,
      1685915746,
      3888969200,
      1414112111,
      2273134842,
      3281911079,
      4080962846,
      172450625,
      2569994100,
      980381355,
      4109958455,
      2819808352,
      2716589560,
      2568741196,
      3681446669,
      3329971472,
      1835478071,
      660984891,
      3704678404,
      4045999559,
      3422617507,
      3040415634,
      1762651403,
      1719377915,
      3470491036,
      2693910283,
      3642056355,
      3138596744,
      1364962596,
      2073328063,
      1983633131,
      926494387,
      3423689081,
      2150032023,
      4096667949,
      1749200295,
      3328846651,
      309677260,
      2016342300,
      1779581495,
      3079819751,
      111262694,
      1274766160,
      443224088,
      298511866,
      1025883608,
      3806446537,
      1145181785,
      168956806,
      3641502830,
      3584813610,
      1689216846,
      3666258015,
      3200248200,
      1692713982,
      2646376535,
      4042768518,
      1618508792,
      1610833997,
      3523052358,
      4130873264,
      2001055236,
      3610705100,
      2202168115,
      4028541809,
      2961195399,
      1006657119,
      2006996926,
      3186142756,
      1430667929,
      3210227297,
      1314452623,
      4074634658,
      4101304120,
      2273951170,
      1399257539,
      3367210612,
      3027628629,
      1190975929,
      2062231137,
      2333990788,
      2221543033,
      2438960610,
      1181637006,
      548689776,
      2362791313,
      3372408396,
      3104550113,
      3145860560,
      296247880,
      1970579870,
      3078560182,
      3769228297,
      1714227617,
      3291629107,
      3898220290,
      166772364,
      1251581989,
      493813264,
      448347421,
      195405023,
      2709975567,
      677966185,
      3703036547,
      1463355134,
      2715995803,
      1338867538,
      1343315457,
      2802222074,
      2684532164,
      233230375,
      2599980071,
      2000651841,
      3277868038,
      1638401717,
      4028070440,
      3237316320,
      6314154,
      819756386,
      300326615,
      590932579,
      1405279636,
      3267499572,
      3150704214,
      2428286686,
      3959192993,
      3461946742,
      1862657033,
      1266418056,
      963775037,
      2089974820,
      2263052895,
      1917689273,
      448879540,
      3550394620,
      3981727096,
      150775221,
      3627908307,
      1303187396,
      508620638,
      2975983352,
      2726630617,
      1817252668,
      1876281319,
      1457606340,
      908771278,
      3720792119,
      3617206836,
      2455994898,
      1729034894,
      1080033504,
      976866871,
      3556439503,
      2881648439,
      1522871579,
      1555064734,
      1336096578,
      3548522304,
      2579274686,
      3574697629,
      3205460757,
      3593280638,
      3338716283,
      3079412587,
      564236357,
      2993598910,
      1781952180,
      1464380207,
      3163844217,
      3332601554,
      1699332808,
      1393555694,
      1183702653,
      3581086237,
      1288719814,
      691649499,
      2847557200,
      2895455976,
      3193889540,
      2717570544,
      1781354906,
      1676643554,
      2592534050,
      3230253752,
      1126444790,
      2770207658,
      2633158820,
      2210423226,
      2615765581,
      2414155088,
      3127139286,
      673620729,
      2805611233,
      1269405062,
      4015350505,
      3341807571,
      4149409754,
      1057255273,
      2012875353,
      2162469141,
      2276492801,
      2601117357,
      993977747,
      3918593370,
      2654263191,
      753973209,
      36408145,
      2530585658,
      25011837,
      3520020182,
      2088578344,
      530523599,
      2918365339,
      1524020338,
      1518925132,
      3760827505,
      3759777254,
      1202760957,
      3985898139,
      3906192525,
      674977740,
      4174734889,
      2031300136,
      2019492241,
      3983892565,
      4153806404,
      3822280332,
      352677332,
      2297720250,
      60907813,
      90501309,
      3286998549,
      1016092578,
      2535922412,
      2839152426,
      457141659,
      509813237,
      4120667899,
      652014361,
      1966332200,
      2975202805,
      55981186,
      2327461051,
      676427537,
      3255491064,
      2882294119,
      3433927263,
      1307055953,
      942726286,
      933058658,
      2468411793,
      3933900994,
      4215176142,
      1361170020,
      2001714738,
      2830558078,
      3274259782,
      1222529897,
      1679025792,
      2729314320,
      3714953764,
      1770335741,
      151462246,
      3013232138,
      1682292957,
      1483529935,
      471910574,
      1539241949,
      458788160,
      3436315007,
      1807016891,
      3718408830,
      978976581,
      1043663428,
      3165965781,
      1927990952,
      4200891579,
      2372276910,
      3208408903,
      3533431907,
      1412390302,
      2931980059,
      4132332400,
      1947078029,
      3881505623,
      4168226417,
      2941484381,
      1077988104,
      1320477388,
      886195818,
      18198404,
      3786409e3,
      2509781533,
      112762804,
      3463356488,
      1866414978,
      891333506,
      18488651,
      661792760,
      1628790961,
      3885187036,
      3141171499,
      876946877,
      2693282273,
      1372485963,
      791857591,
      2686433993,
      3759982718,
      3167212022,
      3472953795,
      2716379847,
      445679433,
      3561995674,
      3504004811,
      3574258232,
      54117162,
      3331405415,
      2381918588,
      3769707343,
      4154350007,
      1140177722,
      4074052095,
      668550556,
      3214352940,
      367459370,
      261225585,
      2610173221,
      4209349473,
      3468074219,
      3265815641,
      314222801,
      3066103646,
      3808782860,
      282218597,
      3406013506,
      3773591054,
      379116347,
      1285071038,
      846784868,
      2669647154,
      3771962079,
      3550491691,
      2305946142,
      453669953,
      1268987020,
      3317592352,
      3279303384,
      3744833421,
      2610507566,
      3859509063,
      266596637,
      3847019092,
      517658769,
      3462560207,
      3443424879,
      370717030,
      4247526661,
      2224018117,
      4143653529,
      4112773975,
      2788324899,
      2477274417,
      1456262402,
      2901442914,
      1517677493,
      1846949527,
      2295493580,
      3734397586,
      2176403920,
      1280348187,
      1908823572,
      3871786941,
      846861322,
      1172426758,
      3287448474,
      3383383037,
      1655181056,
      3139813346,
      901632758,
      1897031941,
      2986607138,
      3066810236,
      3447102507,
      1393639104,
      373351379,
      950779232,
      625454576,
      3124240540,
      4148612726,
      2007998917,
      544563296,
      2244738638,
      2330496472,
      2058025392,
      1291430526,
      424198748,
      50039436,
      29584100,
      3605783033,
      2429876329,
      2791104160,
      1057563949,
      3255363231,
      3075367218,
      3463963227,
      1469046755,
      985887462
    ];
    C_ORIG = [
      1332899944,
      1700884034,
      1701343084,
      1684370003,
      1668446532,
      1869963892
    ];
    __name(_encipher, "_encipher");
    __name(_streamtoword, "_streamtoword");
    __name(_key, "_key");
    __name(_ekskey, "_ekskey");
    __name(_crypt, "_crypt");
    __name(_hash, "_hash");
    __name(encodeBase64, "encodeBase64");
    __name(decodeBase64, "decodeBase64");
    bcryptjs_default = {
      setRandomFallback,
      genSaltSync,
      genSalt,
      hashSync,
      hash,
      compareSync,
      compare,
      getRounds,
      getSalt,
      truncates,
      encodeBase64,
      decodeBase64
    };
  }
});

// lib/user-storage.ts
var UserStorage;
var init_user_storage = __esm({
  "lib/user-storage.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    init_bcryptjs();
    UserStorage = class {
      constructor(db) {
        this.db = db;
      }
      static {
        __name(this, "UserStorage");
      }
      async initializeUsers() {
        try {
          await this.db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT, -- Nullable for social logins
          name TEXT NOT NULL,
          role TEXT DEFAULT 'customer' NOT NULL,
          provider TEXT,
          provider_id TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `).run();
        } catch (error) {
          console.error("Failed to initialize users table:", error);
          throw new Error("Database initialization failed.");
        }
      }
      async createUser(email, password, name) {
        const hashedPassword = bcryptjs_default.hashSync(password, 10);
        const now = (/* @__PURE__ */ new Date()).toISOString();
        try {
          const result = await this.db.prepare(`
        INSERT INTO users (email, name, password)
        VALUES (?, ?, ?)
      `).bind(email, name, hashedPassword).run();
          const userId = result.meta.last_row_id;
          if (!userId) {
            throw new Error("Failed to get user ID after creation.");
          }
          const newUser = await this.getUserById(userId);
          if (!newUser) {
            throw new Error("Could not retrieve newly created user.");
          }
          return newUser;
        } catch (error) {
          console.error("Failed to create user:", error);
          throw error;
        }
      }
      async getUserByEmail(email) {
        try {
          const user = await this.db.prepare(
            "SELECT * FROM users WHERE email = ?"
          ).bind(email).first();
          return user || null;
        } catch (error) {
          console.error("Failed to get user by email:", error);
          return null;
        }
      }
      async validateUser(email, password) {
        try {
          const user = await this.getUserByEmail(email);
          if (user && user.password && bcryptjs_default.compareSync(password, user.password)) {
            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
          }
          return null;
        } catch (error) {
          console.error("Failed to validate user:", error);
          return null;
        }
      }
      async getUserById(id) {
        try {
          const user = await this.db.prepare(
            "SELECT * FROM users WHERE id = ?"
          ).bind(id).first();
          return user || null;
        } catch (error) {
          console.error("Failed to get user by ID:", error);
          return null;
        }
      }
    };
  }
});

// api/tickets/[id]/messages.ts
function json3(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
var onRequestPost3, onRequestGet6, onRequestOptions6;
var init_messages = __esm({
  "api/tickets/[id]/messages.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    init_db();
    init_user_storage();
    __name(json3, "json");
    onRequestPost3 = /* @__PURE__ */ __name(async ({ request, params, env }) => {
      try {
        const ticketId = Number(params.id);
        const expressBase = env?.EXPRESS_API_BASE;
        if (expressBase) {
          const base = expressBase.replace(/\/$/, "");
          const url = `${base}/api/tickets/${ticketId}/messages`;
          const headers = {};
          const cookie = request.headers.get("cookie");
          const ct2 = request.headers.get("content-type");
          const auth = request.headers.get("authorization");
          if (cookie) headers["cookie"] = cookie;
          if (ct2) headers["content-type"] = ct2;
          if (auth) headers["authorization"] = auth;
          const proxied = await fetch(url, {
            method: "POST",
            headers,
            body: request.body,
            redirect: "manual"
          });
          const respHeaders = new Headers(proxied.headers);
          const setCookie = respHeaders.get("set-cookie");
          if (setCookie) {
            const rewritten = setCookie.replace(/;\s*Domain=[^;]+/i, "");
            respHeaders.delete("set-cookie");
            respHeaders.append("set-cookie", rewritten);
          }
          return new Response(proxied.body, { status: proxied.status, headers: respHeaders });
        }
        let content;
        let customerEmail;
        let customerName;
        let isAdmin;
        let attachmentData;
        const ct = request.headers.get("content-type") || "";
        try {
          if (ct.includes("application/json")) {
            const body = await request.json();
            content = body?.content ?? body?.message;
            customerEmail = body?.customerEmail;
            customerName = body?.customerName;
            isAdmin = !!body?.isAdmin;
          } else if (ct.includes("multipart/form-data")) {
            const form = await request.formData();
            const raw = form.get("content") ?? form.get("message");
            content = typeof raw === "string" ? raw : void 0;
            const ce = form.get("customerEmail");
            customerEmail = typeof ce === "string" ? ce : void 0;
            const cn = form.get("customerName");
            customerName = typeof cn === "string" ? cn : void 0;
            const ia = form.get("isAdmin");
            isAdmin = typeof ia === "string" ? ia === "true" : false;
            const attachments = [];
            for (const [key, value] of form.entries()) {
              if (key.startsWith("attachment_") && value instanceof File) {
                attachments.push({
                  name: value.name,
                  type: value.type,
                  size: value.size
                });
              }
            }
            if (attachments.length > 0) {
              content = content || "[File attachment]";
              attachmentData = JSON.stringify(attachments);
            }
          } else {
            try {
              const body = await request.json();
              content = body?.content ?? body?.message;
              customerEmail = body?.customerEmail;
              customerName = body?.customerName;
              isAdmin = !!body?.isAdmin;
            } catch {
              const text = await request.text();
              content = text || void 0;
            }
          }
        } catch {
          const text = await request.text();
          content = text || void 0;
        }
        content = typeof content === "string" ? content.trim() : content;
        const hasAttachments = request.headers.get("content-type")?.includes("multipart/form-data");
        if (!content && !hasAttachments) {
          return json3({ success: false, message: "Missing content" }, 400);
        }
        if (!content && hasAttachments) {
          content = "[File attachment]";
        }
        const storage = new TicketStorage(env.DB);
        const ticket = await storage.getTicketById(ticketId);
        if (!ticket) return json3({ success: false, message: "Ticket not found" }, 200);
        let finalSenderName = customerName;
        if (!customerName && customerEmail && !isAdmin) {
          try {
            const userStorage = new UserStorage(env.DB);
            await userStorage.initializeUsers();
            const user = await userStorage.getUserByEmail(customerEmail);
            if (user) {
              finalSenderName = user.name;
            }
          } catch (error) {
            console.error("Failed to fetch user name for message:", error);
          }
        }
        const msg = await storage.addTicketMessage({
          ticket_id: ticketId,
          message: content || "[File attachment]",
          is_from_customer: !isAdmin,
          sender_name: finalSenderName || (isAdmin ? "Admin" : ticket.customer_name),
          sender_email: customerEmail || (isAdmin ? void 0 : ticket.customer_email),
          attachments: attachmentData
        });
        return json3({ success: true, message: msg });
      } catch (error) {
        console.error("Failed to add message:", error);
        const message = error instanceof Error ? error.message : "An unknown error occurred";
        return json3({ success: false, message }, 500);
      }
    }, "onRequestPost");
    onRequestGet6 = /* @__PURE__ */ __name(async ({ request, params, env }) => {
      const ticketId = Number(params.id);
      const expressBase = env?.EXPRESS_API_BASE;
      if (expressBase) {
        const base = expressBase.replace(/\/$/, "");
        const url = `${base}/api/tickets/${ticketId}/messages`;
        const headers = {};
        const cookie = request.headers.get("cookie");
        const auth = request.headers.get("authorization");
        if (cookie) headers["cookie"] = cookie;
        if (auth) headers["authorization"] = auth;
        const proxied = await fetch(url, { headers, redirect: "manual" });
        const respHeaders = new Headers(proxied.headers);
        const setCookie = respHeaders.get("set-cookie");
        if (setCookie) {
          const rewritten = setCookie.replace(/;\s*Domain=[^;]+/i, "");
          respHeaders.delete("set-cookie");
          respHeaders.append("set-cookie", rewritten);
        }
        return new Response(proxied.body, { status: proxied.status, headers: respHeaders });
      }
      const storage = new TicketStorage(env.DB);
      const messages = await storage.getTicketMessages(ticketId);
      const mapped = messages.map((m) => ({
        id: m.id,
        ticketId: m.ticket_id,
        content: m.message,
        isAdmin: !m.is_from_customer,
        authorName: m.sender_name,
        createdAt: m.created_at,
        attachments: []
      }));
      return json3(mapped);
    }, "onRequestGet");
    onRequestOptions6 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
  }
});

// api/tickets/[id]/status.ts
function getStore() {
  const s = globalThis.__TICKET_STORE__;
  if (!s) {
    globalThis.__TICKET_STORE__ = { tickets: [], messages: /* @__PURE__ */ new Map(), seq: 1, msgSeq: 1 };
  }
  return globalThis.__TICKET_STORE__;
}
function json4(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
function toInternalStatus(input) {
  if (input === "in_progress") return "in-progress";
  if (input === "closed") return "closed";
  return input || "open";
}
var onRequestPut5, onRequestOptions7;
var init_status = __esm({
  "api/tickets/[id]/status.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    __name(getStore, "getStore");
    __name(json4, "json");
    __name(toInternalStatus, "toInternalStatus");
    onRequestPut5 = /* @__PURE__ */ __name(async ({ request, params, env }) => {
      try {
        const ticketId = Number(params.id);
        const expressBase = env?.EXPRESS_API_BASE;
        if (expressBase) {
          const base = expressBase.replace(/\/$/, "");
          const url = `${base}/api/tickets/${ticketId}/status`;
          const headers = {};
          const cookie = request.headers.get("cookie");
          const ct = request.headers.get("content-type");
          const auth = request.headers.get("authorization");
          if (cookie) headers["cookie"] = cookie;
          if (ct) headers["content-type"] = ct;
          if (auth) headers["authorization"] = auth;
          const proxied = await fetch(url, { method: "PUT", headers, body: request.body, redirect: "manual" });
          const respHeaders = new Headers(proxied.headers);
          const setCookie = respHeaders.get("set-cookie");
          if (setCookie) {
            const rewritten = setCookie.replace(/;\s*Domain=[^;]+/i, "");
            respHeaders.delete("set-cookie");
            respHeaders.append("set-cookie", rewritten);
          }
          return new Response(proxied.body, { status: proxied.status, headers: respHeaders });
        }
        const body = await request.json().catch(() => ({}));
        const status = body?.status;
        if (!status) return json4({ success: false, message: "Missing status" }, 400);
        const store = getStore();
        const idx = store.tickets.findIndex((t) => t.id === ticketId);
        if (idx === -1) return json4({ success: false, message: "Ticket not found" }, 404);
        const now = (/* @__PURE__ */ new Date()).toISOString();
        store.tickets[idx] = {
          ...store.tickets[idx],
          status: toInternalStatus(status),
          updated_at: now
        };
        return json4({ success: true, ticket: store.tickets[idx] });
      } catch (e) {
        return json4({ success: false, message: "Failed to update status" }, 500);
      }
    }, "onRequestPut");
    onRequestOptions7 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "PUT, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
  }
});

// api/user/[id]/purchase-status.ts
function json5(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
var onRequestGet7;
var init_purchase_status = __esm({
  "api/user/[id]/purchase-status.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    __name(json5, "json");
    onRequestGet7 = /* @__PURE__ */ __name(async ({ request, params, env }) => {
      try {
        const userId = params.id;
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return json5({
            hasPurchased: false,
            totalSpent: "0.00",
            completedOrders: 0,
            lastPurchaseDate: null
          });
        }
        const token = authHeader.substring(7);
        if (token === "demo-jwt-token" || token.startsWith("jwt-token-") && token.split("-")[2] === "1") {
          return json5({
            hasPurchased: true,
            totalSpent: "29.99",
            completedOrders: 1,
            lastPurchaseDate: Date.now()
          });
        }
        if (!env.DB) {
          return json5({
            hasPurchased: false,
            totalSpent: "0.00",
            completedOrders: 0,
            lastPurchaseDate: null
          });
        }
        try {
          const user = await env.DB.prepare(`
        SELECT id, extension_activated, is_premium
        FROM users WHERE id = ?
      `).bind(parseInt(userId)).first();
          let customer = null;
          let hasPremiumStatus = false;
          let hasExtensionActivated = false;
          if (user) {
            hasPremiumStatus = user.is_premium === 1;
            hasExtensionActivated = user.extension_activated === 1;
            console.log("User found:", userId, "Premium:", hasPremiumStatus, "Extension:", hasExtensionActivated);
          } else {
            customer = await env.DB.prepare(`
          SELECT id, extension_activated, is_premium
          FROM customers WHERE id = ?
        `).bind(parseInt(userId)).first();
            if (customer) {
              hasPremiumStatus = customer.is_premium === 1;
              hasExtensionActivated = customer.extension_activated === 1;
              console.log("Customer found:", userId, "Premium:", hasPremiumStatus, "Extension:", hasExtensionActivated);
            }
          }
          if (!user && !customer) {
            return json5({
              hasPurchased: false,
              totalSpent: "0.00",
              completedOrders: 0,
              lastPurchaseDate: null
            });
          }
          const orderStats = await env.DB.prepare(`
        SELECT COUNT(*) as completedOrders, 
               SUM(final_amount) as totalPaid,
               MAX(completed_at) as lastPurchaseDate
        FROM orders 
        WHERE customer_id = ? AND status = 'completed' AND final_amount > 0
      `).bind(parseInt(userId)).first();
          const completedOrders = Number(orderStats?.completedOrders || 0);
          const totalPaid = String(orderStats?.totalPaid || "0.00");
          const lastPurchaseDate = orderStats?.lastPurchaseDate;
          const hasPurchased = hasPremiumStatus && hasExtensionActivated;
          return json5({
            hasPurchased,
            totalSpent: totalPaid,
            completedOrders,
            lastPurchaseDate: lastPurchaseDate ? new Date(String(lastPurchaseDate)).getTime() : null
          });
        } catch (dbError) {
          console.error("Database error in purchase-status:", dbError);
          return json5({
            hasPurchased: false,
            totalSpent: "0.00",
            completedOrders: 0,
            lastPurchaseDate: null
          });
        }
      } catch (error) {
        return json5({
          error: error.message
        }, 500);
      }
    }, "onRequestGet");
  }
});

// api/user/[userId]/invoices.ts
var onRequestGet8, onRequestOptions8;
var init_invoices = __esm({
  "api/user/[userId]/invoices.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    onRequestGet8 = /* @__PURE__ */ __name(async (context) => {
      try {
        const { params } = context;
        const userId = params.userId;
        if (!userId) {
          return new Response(JSON.stringify({ error: "User ID is required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }
        const invoicesQuery = `
      SELECT 
        i.id,
        i.invoiceNumber,
        i.orderId,
        i.amount,
        i.currency,
        i.taxAmount,
        i.status,
        i.invoiceDate,
        i.dueDate,
        i.paidAt,
        i.createdAt,
        o.productId,
        o.paymentMethod,
        u.name as customerName,
        u.email as customerEmail
      FROM invoices i
      LEFT JOIN orders o ON i.orderId = o.id
      LEFT JOIN users u ON o.customerEmail = u.email
      WHERE u.id = ? 
      ORDER BY i.createdAt DESC
    `;
        const invoicesResult = await context.env.DB.prepare(invoicesQuery).bind(userId).all();
        return new Response(JSON.stringify(invoicesResult.results || []), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
          }
        });
      } catch (error) {
        console.error("Error fetching user invoices:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch invoices" }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestGet");
    onRequestOptions8 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
  }
});

// api/user/[userId]/orders.ts
var onRequestGet9, onRequestOptions9;
var init_orders = __esm({
  "api/user/[userId]/orders.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    onRequestGet9 = /* @__PURE__ */ __name(async (context) => {
      try {
        const { params } = context;
        const userId = params.userId;
        if (!userId) {
          return new Response(JSON.stringify({ error: "User ID is required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }
        const ordersQuery = `
      SELECT 
        id,
        customerEmail,
        customerName,
        productId,
        originalAmount,
        finalAmount,
        currency,
        status,
        paymentMethod,
        downloadToken,
        downloadCount,
        maxDownloads,
        activationCode,
        createdAt,
        completedAt
      FROM orders 
      WHERE customerEmail = (SELECT email FROM users WHERE id = ?)
      ORDER BY createdAt DESC
    `;
        const ordersResult = await context.env.DB.prepare(ordersQuery).bind(userId).all();
        return new Response(JSON.stringify(ordersResult.results || []), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
          }
        });
      } catch (error) {
        console.error("Error fetching user orders:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch orders" }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestGet");
    onRequestOptions9 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
  }
});

// api/user/[userId]/purchase-status.ts
var onRequestGet10, onRequestOptions10;
var init_purchase_status2 = __esm({
  "api/user/[userId]/purchase-status.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    onRequestGet10 = /* @__PURE__ */ __name(async (context) => {
      try {
        const { params } = context;
        const userId = params.userId;
        if (!userId) {
          return new Response(JSON.stringify({ error: "User ID is required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }
        if (!context.env.DB) {
          return new Response(JSON.stringify({
            hasPurchased: false,
            totalSpent: "0.00",
            completedOrders: 0,
            lastPurchaseDate: null
          }), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        let userResult = null;
        try {
          try {
            const customerQuery = `SELECT email FROM customers WHERE id = ?`;
            userResult = await context.env.DB.prepare(customerQuery).bind(userId).first();
          } catch (e) {
            try {
              const customerQuery = `SELECT email FROM customers WHERE id = ?`;
              userResult = await context.env.DB.prepare(customerQuery).bind(parseInt(userId)).first();
            } catch (e2) {
              console.log("Customers table query failed");
            }
          }
          if (!userResult) {
            try {
              const usersQuery = `SELECT email FROM users WHERE id = ?`;
              userResult = await context.env.DB.prepare(usersQuery).bind(userId).first();
            } catch (e) {
              try {
                const usersQuery = `SELECT email FROM users WHERE id = ?`;
                userResult = await context.env.DB.prepare(usersQuery).bind(parseInt(userId)).first();
              } catch (e2) {
                console.log("Users table query also failed");
              }
            }
          }
        } catch (tableError) {
          console.log("Table access error:", tableError);
        }
        if (!userResult) {
          return new Response(JSON.stringify({
            hasPurchased: false,
            totalSpent: "0.00",
            completedOrders: 0,
            lastPurchaseDate: null
          }), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        let statusResult = null;
        try {
          const queryVariations = [
            `SELECT 
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completedOrders,
          COALESCE(SUM(CASE WHEN status = 'completed' THEN CAST(final_amount as REAL) ELSE 0 END), 0) as totalSpent,
          MAX(CASE WHEN status = 'completed' THEN created_at END) as lastPurchaseDate
        FROM orders 
        WHERE (user_id = ? OR customer_email = ?)`,
            `SELECT 
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completedOrders,
          COALESCE(SUM(CASE WHEN status = 'completed' THEN CAST("finalAmount" as REAL) ELSE 0 END), 0) as totalSpent,
          MAX(CASE WHEN status = 'completed' THEN "createdAt" END) as lastPurchaseDate
        FROM orders 
        WHERE ("userId" = ? OR "customerEmail" = ?)`,
            `SELECT 
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completedOrders,
          COALESCE(SUM(CASE WHEN status = 'completed' THEN CAST(finalAmount as REAL) ELSE 0 END), 0) as totalSpent,
          MAX(CASE WHEN status = 'completed' THEN createdAt END) as lastPurchaseDate
        FROM orders 
        WHERE (userId = ? OR customerEmail = ?)`
          ];
          for (const query of queryVariations) {
            try {
              statusResult = await context.env.DB.prepare(query).bind(userId, userResult.email).first();
              if (statusResult) break;
            } catch (e) {
              try {
                statusResult = await context.env.DB.prepare(query).bind(parseInt(userId), userResult.email).first();
                if (statusResult) break;
              } catch (e2) {
                console.log("Query variation failed, trying next");
              }
            }
          }
        } catch (queryError) {
          console.log("All order queries failed:", queryError);
        }
        const hasPurchased = (statusResult?.completedOrders || 0) > 0;
        const totalSpent = (statusResult?.totalSpent || 0).toFixed(2);
        const completedOrders = statusResult?.completedOrders || 0;
        const lastPurchaseDate = statusResult?.lastPurchaseDate ? new Date(statusResult.lastPurchaseDate).getTime() : null;
        return new Response(JSON.stringify({
          hasPurchased,
          totalSpent,
          completedOrders,
          lastPurchaseDate
        }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
          }
        });
      } catch (error) {
        console.error("Error fetching purchase status:", error);
        return new Response(JSON.stringify({
          hasPurchased: false,
          totalSpent: "0.00",
          completedOrders: 0,
          lastPurchaseDate: null
        }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestGet");
    onRequestOptions10 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
  }
});

// api/admin/analytics.ts
var onRequestGet11, onRequestOptions11;
var init_analytics = __esm({
  "api/admin/analytics.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    onRequestGet11 = /* @__PURE__ */ __name(async (context) => {
      try {
        const ordersStatsQuery = `
      SELECT 
        COUNT(*) as totalOrders,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completedOrders,
        SUM(CASE WHEN status = 'completed' THEN CAST(final_amount as REAL) ELSE 0 END) as totalRevenue
      FROM orders
    `;
        const usersStatsQuery = `
      SELECT 
        COUNT(*) as totalUsers,
        COUNT(CASE WHEN is_premium = 1 THEN 1 END) as premiumUsers
      FROM users
    `;
        const [ordersStats, usersStats] = await Promise.all([
          context.env.DB.prepare(ordersStatsQuery).first(),
          context.env.DB.prepare(usersStatsQuery).first()
        ]);
        const analytics = {
          totalRevenue: Number(ordersStats?.totalRevenue) || 0,
          totalSales: Number(ordersStats?.completedOrders) || 0,
          activeCustomers: Number(usersStats?.totalUsers) || 0,
          avgRating: 4.9
          // Static rating
        };
        return new Response(JSON.stringify({
          success: true,
          ...analytics
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
          }
        });
      } catch (error) {
        console.error("Failed to get analytics:", error);
        return new Response(JSON.stringify({
          success: false,
          message: "Failed to load analytics",
          totalRevenue: 0,
          totalSales: 0,
          activeCustomers: 0,
          avgRating: 4.9
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestGet");
    onRequestOptions11 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
  }
});

// api/admin/announcement-badges.ts
var onRequestOptions12, onRequestGet12, onRequestPost4, onRequestPut6, onRequestDelete3;
var init_announcement_badges = __esm({
  "api/admin/announcement-badges.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    init_settings_storage();
    onRequestOptions12 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }, "onRequestOptions");
    onRequestGet12 = /* @__PURE__ */ __name(async (context) => {
      try {
        const settingsStorage = new SettingsStorage(context.env.DB);
        const badgesData = await settingsStorage.getSetting("announcement_badges");
        const badges = badgesData ? JSON.parse(badgesData) : [];
        console.log("Retrieved announcement badges:", badges.length);
        return new Response(JSON.stringify(badges), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Error fetching announcement badges:", error);
        return new Response(JSON.stringify({
          error: "Failed to fetch announcement badges",
          details: error instanceof Error ? error.message : "Unknown error"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestGet");
    onRequestPost4 = /* @__PURE__ */ __name(async (context) => {
      try {
        const settingsStorage = new SettingsStorage(context.env.DB);
        const requestData = await context.request.json();
        console.log("Creating new announcement badge:", JSON.stringify(requestData, null, 2));
        const newBadge = {
          id: crypto.randomUUID(),
          title: requestData.title || requestData.text || requestData.badgeText || requestData.content || requestData.message || "",
          subtitle: requestData.subtitle || "",
          backgroundColor: requestData.backgroundColor || requestData.bgColor || requestData.background || "#007cba",
          textColor: requestData.textColor || requestData.color || requestData.foreground || "#ffffff",
          priority: parseInt(requestData.priority) || 1,
          isActive: requestData.isActive !== void 0 ? Boolean(requestData.isActive) : requestData.enabled !== void 0 ? Boolean(requestData.enabled) : true,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        console.log("Created badge object:", JSON.stringify(newBadge, null, 2));
        if (requestData.autoTranslate !== false && newBadge.title) {
          try {
            let openaiApiKey = context.env.OPENAI_API_KEY;
            if (!openaiApiKey) {
              const apiKeySetting = await settingsStorage.getSetting("openai_api_key");
              openaiApiKey = apiKeySetting;
            }
            if (openaiApiKey) {
              const supportedLanguages = ["de", "fr", "es", "it", "pt", "nl", "da", "no", "fi", "tr", "pl", "ru"];
              const translationResponse = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${openaiApiKey}`,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  model: "gpt-4o",
                  messages: [
                    {
                      role: "system",
                      content: "You are a professional translator specializing in marketing content. Provide accurate, culturally appropriate translations that maintain the marketing impact of the original text."
                    },
                    {
                      role: "user",
                      content: `Translate the following announcement badge text into multiple languages.

Original text (English): "${newBadge.title}"
Context: Announcement badge for a Chrome extension product website
Target languages: ${supportedLanguages.map((code) => `${code}: ${{ "de": "German", "fr": "French", "es": "Spanish", "it": "Italian", "pt": "Portuguese", "nl": "Dutch", "da": "Danish", "no": "Norwegian", "fi": "Finnish", "tr": "Turkish", "pl": "Polish", "ru": "Russian" }[code]}`).join(", ")}
Tone: Marketing/promotional tone

Requirements:
- Maintain the marketing/promotional tone
- Keep the same emotional impact as the original
- Adapt cultural nuances appropriately for each target market
- Keep translations concise and impactful for badge display
- Ensure translations sound natural to native speakers

Respond with a JSON object where keys are language codes (${supportedLanguages.join(", ")}) and values are the translated text.

Example format:
{
  "de": "German translation here",
  "fr": "French translation here"
}`
                    }
                  ],
                  response_format: { type: "json_object" },
                  temperature: 0.3,
                  max_tokens: 1e3
                })
              });
              if (translationResponse.ok) {
                const data = await translationResponse.json();
                const translationText = data.choices[0]?.message?.content;
                if (translationText) {
                  const translations = JSON.parse(translationText);
                  newBadge.textTranslations = translations;
                  console.log("Auto-translated badge to languages:", Object.keys(translations));
                }
              }
            }
          } catch (translationError) {
            console.warn("Auto-translation failed, continuing without translations:", translationError);
          }
        }
        const existingBadgesData = await settingsStorage.getSetting("announcement_badges");
        const existingBadges = existingBadgesData ? JSON.parse(existingBadgesData) : [];
        existingBadges.push(newBadge);
        await settingsStorage.setSetting("announcement_badges", JSON.stringify(existingBadges));
        console.log("Created announcement badge:", newBadge.id);
        return new Response(JSON.stringify({ badge: newBadge }), {
          status: 201,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Error creating announcement badge:", error);
        return new Response(JSON.stringify({
          error: "Failed to create announcement badge",
          details: error instanceof Error ? error.message : "Unknown error"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestPost");
    onRequestPut6 = /* @__PURE__ */ __name(async (context) => {
      try {
        const settingsStorage = new SettingsStorage(context.env.DB);
        const requestData = await context.request.json();
        const badgeId = requestData.id;
        if (!badgeId) {
          return new Response(JSON.stringify({ error: "Badge ID is required" }), {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        console.log("Updating announcement badge:", badgeId);
        const existingBadgesData = await settingsStorage.getSetting("announcement_badges");
        const existingBadges = existingBadgesData ? JSON.parse(existingBadgesData) : [];
        const badgeIndex = existingBadges.findIndex((badge) => badge.id === badgeId);
        if (badgeIndex === -1) {
          return new Response(JSON.stringify({ error: "Badge not found" }), {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        existingBadges[badgeIndex] = {
          ...existingBadges[badgeIndex],
          title: requestData.title || requestData.text || requestData.badgeText || existingBadges[badgeIndex].title,
          subtitle: requestData.subtitle || existingBadges[badgeIndex].subtitle,
          backgroundColor: requestData.backgroundColor || requestData.bgColor || existingBadges[badgeIndex].backgroundColor,
          textColor: requestData.textColor || requestData.color || existingBadges[badgeIndex].textColor,
          priority: requestData.priority ? parseInt(requestData.priority) : existingBadges[badgeIndex].priority,
          isActive: requestData.isActive !== void 0 ? requestData.isActive : existingBadges[badgeIndex].isActive,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        await settingsStorage.setSetting("announcement_badges", JSON.stringify(existingBadges));
        console.log("Updated announcement badge:", badgeId);
        return new Response(JSON.stringify({ badge: existingBadges[badgeIndex] }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Error updating announcement badge:", error);
        return new Response(JSON.stringify({
          error: "Failed to update announcement badge",
          details: error instanceof Error ? error.message : "Unknown error"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestPut");
    onRequestDelete3 = /* @__PURE__ */ __name(async (context) => {
      try {
        const settingsStorage = new SettingsStorage(context.env.DB);
        const url = new URL(context.request.url);
        const badgeId = url.searchParams.get("id");
        if (!badgeId) {
          return new Response(JSON.stringify({ error: "Badge ID is required" }), {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        console.log("Deleting announcement badge:", badgeId);
        const existingBadgesData = await settingsStorage.getSetting("announcement_badges");
        const existingBadges = existingBadgesData ? JSON.parse(existingBadgesData) : [];
        const updatedBadges = existingBadges.filter((badge) => badge.id !== badgeId);
        if (updatedBadges.length === existingBadges.length) {
          return new Response(JSON.stringify({ error: "Badge not found" }), {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        await settingsStorage.setSetting("announcement_badges", JSON.stringify(updatedBadges));
        console.log("Deleted announcement badge:", badgeId);
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Error deleting announcement badge:", error);
        return new Response(JSON.stringify({
          error: "Failed to delete announcement badge",
          details: error instanceof Error ? error.message : "Unknown error"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestDelete");
  }
});

// api/admin/auth-settings.ts
var onRequestGet13, onRequestPut7, onRequestOptions13;
var init_auth_settings = __esm({
  "api/admin/auth-settings.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    onRequestGet13 = /* @__PURE__ */ __name(async (context) => {
      const { env } = context;
      try {
        const selectQuery = `SELECT * FROM auth_settings WHERE id = 1`;
        const result = await env.DB.prepare(selectQuery).first();
        if (!result) {
          const defaultSettings2 = {
            googleEnabled: false,
            facebookEnabled: false,
            githubEnabled: false,
            recaptchaEnabled: false,
            recaptchaCustomerEnabled: false,
            recaptchaAdminEnabled: false,
            recaptchaSiteKey: "",
            googleClientId: "",
            googleClientSecret: "",
            facebookAppId: "",
            facebookAppSecret: "",
            githubClientId: "",
            githubClientSecret: "",
            jwtSecret: "demo-jwt-secret",
            sessionTimeout: 3600
          };
          return new Response(JSON.stringify(defaultSettings2), {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        const authSettings = {
          googleEnabled: Boolean(result.google_enabled),
          facebookEnabled: Boolean(result.facebook_enabled),
          githubEnabled: Boolean(result.github_enabled),
          recaptchaEnabled: Boolean(result.recaptcha_enabled),
          recaptchaCustomerEnabled: Boolean(result.recaptcha_customer_enabled),
          recaptchaAdminEnabled: Boolean(result.recaptcha_admin_enabled),
          recaptchaSiteKey: result.recaptcha_site_key || "",
          googleClientId: result.google_client_id || "",
          googleClientSecret: result.google_client_secret || "",
          facebookAppId: result.facebook_app_id || "",
          facebookAppSecret: result.facebook_app_secret || "",
          githubClientId: result.github_client_id || "",
          githubClientSecret: result.github_client_secret || "",
          jwtSecret: result.jwt_secret || "demo-jwt-secret",
          sessionTimeout: result.session_timeout || 3600
        };
        return new Response(JSON.stringify(authSettings), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Error fetching auth settings:", error);
        return new Response(JSON.stringify({
          message: "Error fetching auth settings: " + error.message
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestGet");
    onRequestPut7 = /* @__PURE__ */ __name(async (context) => {
      const { request, env } = context;
      try {
        const settings = await request.json();
        const updateData = {
          google_enabled: settings.googleEnabled ? 1 : 0,
          google_client_id: settings.googleClientId || null,
          google_client_secret: settings.googleClientSecret || null,
          facebook_enabled: settings.facebookEnabled ? 1 : 0,
          facebook_app_id: settings.facebookAppId || null,
          facebook_app_secret: settings.facebookAppSecret || null,
          github_enabled: settings.githubEnabled ? 1 : 0,
          github_client_id: settings.githubClientId || null,
          github_client_secret: settings.githubClientSecret || null,
          recaptcha_enabled: settings.recaptchaEnabled ? 1 : 0,
          recaptcha_site_key: settings.recaptchaSiteKey || null,
          recaptcha_secret_key: settings.recaptchaSecretKey || null,
          recaptcha_mode: settings.recaptchaMode || "v2",
          recaptcha_customer_enabled: settings.recaptchaCustomerEnabled ? 1 : 0,
          recaptcha_admin_enabled: settings.recaptchaAdminEnabled ? 1 : 0,
          jwt_secret: settings.jwtSecret || "demo-jwt-secret",
          session_timeout: settings.sessionTimeout || 3600,
          stripe_enabled: settings.stripeEnabled ? 1 : 0,
          stripe_public_key: settings.stripePublicKey || null,
          stripe_secret_key: settings.stripeSecretKey || null,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        const updateQuery = `
      UPDATE auth_settings 
      SET google_enabled = ?, google_client_id = ?, google_client_secret = ?,
          facebook_enabled = ?, facebook_app_id = ?, facebook_app_secret = ?,
          github_enabled = ?, github_client_id = ?, github_client_secret = ?,
          recaptcha_enabled = ?, recaptcha_site_key = ?, recaptcha_secret_key = ?,
          recaptcha_mode = ?, recaptcha_customer_enabled = ?, recaptcha_admin_enabled = ?,
          jwt_secret = ?, session_timeout = ?, stripe_enabled = ?, stripe_public_key = ?, 
          stripe_secret_key = ?, updated_at = ?
      WHERE id = 1
    `;
        await env.DB.prepare(updateQuery).bind(
          updateData.google_enabled,
          updateData.google_client_id,
          updateData.google_client_secret,
          updateData.facebook_enabled,
          updateData.facebook_app_id,
          updateData.facebook_app_secret,
          updateData.github_enabled,
          updateData.github_client_id,
          updateData.github_client_secret,
          updateData.recaptcha_enabled,
          updateData.recaptcha_site_key,
          updateData.recaptcha_secret_key,
          updateData.recaptcha_mode,
          updateData.recaptcha_customer_enabled,
          updateData.recaptcha_admin_enabled,
          updateData.jwt_secret,
          updateData.session_timeout,
          updateData.stripe_enabled,
          updateData.stripe_public_key,
          updateData.stripe_secret_key,
          updateData.updated_at
        ).run();
        const selectQuery = `SELECT * FROM auth_settings WHERE id = 1`;
        const result = await env.DB.prepare(selectQuery).first();
        const updatedSettings = {
          googleEnabled: Boolean(result.google_enabled),
          facebookEnabled: Boolean(result.facebook_enabled),
          githubEnabled: Boolean(result.github_enabled),
          recaptchaEnabled: Boolean(result.recaptcha_enabled),
          recaptchaCustomerEnabled: Boolean(result.recaptcha_customer_enabled),
          recaptchaAdminEnabled: Boolean(result.recaptcha_admin_enabled),
          recaptchaSiteKey: result.recaptcha_site_key || "",
          googleClientId: result.google_client_id || "",
          facebookAppId: result.facebook_app_id || "",
          githubClientId: result.github_client_id || ""
        };
        return new Response(JSON.stringify(updatedSettings), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Error updating auth settings:", error);
        return new Response(JSON.stringify({
          success: false,
          message: "Failed to update authentication settings: " + error.message
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestPut");
    onRequestOptions13 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
  }
});

// api/admin/chat-settings.ts
var onRequestGet14, onRequestPut8, onRequestOptions14;
var init_chat_settings = __esm({
  "api/admin/chat-settings.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    init_settings_storage();
    onRequestGet14 = /* @__PURE__ */ __name(async ({ env }) => {
      try {
        if (!env.DB) {
          return new Response(JSON.stringify({
            success: false,
            message: "Database not available"
          }), {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        const settingsStorage = new SettingsStorage(env.DB);
        await settingsStorage.initializeSettings();
        const settings = await settingsStorage.getChatSettings();
        return new Response(JSON.stringify({
          success: true,
          ...settings
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Failed to get chat settings:", error);
        return new Response(JSON.stringify({
          success: false,
          message: "Failed to load chat settings"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestGet");
    onRequestPut8 = /* @__PURE__ */ __name(async ({ request, env }) => {
      try {
        console.log("Chat settings PUT request received");
        console.log("Environment DB available:", !!env.DB);
        if (!env.DB) {
          console.error("Database not available in environment");
          return new Response(JSON.stringify({
            success: false,
            message: "Database not available"
          }), {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        const requestBody = await request.json();
        console.log("Request body received:", requestBody);
        const { openaiApiKey, assistantId, chatModel, enabled } = requestBody;
        console.log("Initializing settings storage...");
        const settingsStorage = new SettingsStorage(env.DB);
        try {
          await settingsStorage.initializeSettings();
          console.log("Settings storage initialized successfully");
        } catch (initError) {
          console.error("Failed to initialize settings storage:", initError);
          throw initError;
        }
        const settingsToUpdate = {};
        if (openaiApiKey && openaiApiKey.trim() !== "" && openaiApiKey !== "***hidden***") {
          settingsToUpdate.openaiApiKey = openaiApiKey.trim();
        }
        if (assistantId !== void 0) {
          settingsToUpdate.assistantId = assistantId;
        }
        if (chatModel && chatModel.trim() !== "") {
          settingsToUpdate.chatModel = chatModel.trim();
        }
        if (enabled !== void 0) {
          settingsToUpdate.enabled = enabled;
        }
        console.log("Settings to update:", settingsToUpdate);
        try {
          await settingsStorage.setChatSettings(settingsToUpdate);
          console.log("Settings updated successfully");
        } catch (updateError) {
          console.error("Failed to update settings:", updateError);
          throw updateError;
        }
        return new Response(JSON.stringify({
          success: true,
          message: "Chat settings updated successfully"
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Chat settings PUT error:", error);
        console.error("Error stack:", error.stack);
        return new Response(JSON.stringify({
          success: false,
          message: `Failed to update chat settings: ${error.message || error}`,
          error: error.toString()
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestPut");
    onRequestOptions14 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }, "onRequestOptions");
  }
});

// api/admin/check-user-data.ts
function json6(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
var onRequestGet15;
var init_check_user_data = __esm({
  "api/admin/check-user-data.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    __name(json6, "json");
    onRequestGet15 = /* @__PURE__ */ __name(async ({ request, env }) => {
      try {
        const url = new URL(request.url);
        const email = url.searchParams.get("email");
        if (!email) {
          return json6({ success: false, message: "Email required" }, 400);
        }
        if (!env.DB) {
          return json6({ success: false, message: "Database not available" }, 500);
        }
        const user = await env.DB.prepare(`
      SELECT id, email, name, is_premium, extension_activated, premium_activated_at, created_at
      FROM users WHERE email = ?
    `).bind(email).first();
        const customer = await env.DB.prepare(`
      SELECT id, email, name, is_premium, extension_activated, created_at
      FROM customers WHERE email = ?
    `).bind(email).first();
        const orders = await env.DB.prepare(`
      SELECT id, customer_id, customer_email, original_amount, final_amount, status, created_at, completed_at
      FROM orders WHERE customer_email = ?
    `).bind(email).all();
        const invoices = await env.DB.prepare(`
      SELECT id, invoice_number, customer_id, order_id, amount, status, created_at
      FROM invoices WHERE customer_id IN (
        SELECT id FROM customers WHERE email = ?
        UNION
        SELECT id FROM users WHERE email = ?
      )
    `).bind(email, email).all();
        return json6({
          success: true,
          email,
          user,
          customer,
          orders: orders.results,
          invoices: invoices.results,
          summary: {
            userExists: !!user,
            customerExists: !!customer,
            userPremium: user?.is_premium === 1,
            customerPremium: customer?.is_premium === 1,
            userExtensionActivated: user?.extension_activated === 1,
            customerExtensionActivated: customer?.extension_activated === 1,
            totalOrders: orders.results?.length || 0,
            totalInvoices: invoices.results?.length || 0
          }
        });
      } catch (error) {
        console.error("Error checking user data:", error);
        return json6({
          success: false,
          message: error.message
        }, 500);
      }
    }, "onRequestGet");
  }
});

// api/admin/countdown-banners.ts
var onRequestOptions15, onRequestGet16, onRequestPost5, onRequestPut9, onRequestDelete4;
var init_countdown_banners = __esm({
  "api/admin/countdown-banners.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    init_settings_storage();
    onRequestOptions15 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }, "onRequestOptions");
    onRequestGet16 = /* @__PURE__ */ __name(async (context) => {
      try {
        const settingsStorage = new SettingsStorage(context.env.DB);
        const bannersData = await settingsStorage.getSetting("countdown_banners");
        const banners = bannersData ? JSON.parse(bannersData) : [];
        console.log("Retrieved countdown banners:", banners.length);
        return new Response(JSON.stringify(banners), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Error fetching countdown banners:", error);
        return new Response(JSON.stringify({
          error: "Failed to fetch countdown banners",
          details: error instanceof Error ? error.message : "Unknown error"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestGet");
    onRequestPost5 = /* @__PURE__ */ __name(async (context) => {
      try {
        const settingsStorage = new SettingsStorage(context.env.DB);
        const requestData = await context.request.json();
        console.log("Creating new countdown banner:", requestData);
        const newBanner = {
          id: crypto.randomUUID(),
          title: requestData.title || "",
          subtitle: requestData.subtitle || "",
          targetPrice: parseFloat(requestData.targetPrice) || 0,
          originalPrice: parseFloat(requestData.originalPrice) || 0,
          endDate: requestData.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString(),
          priority: requestData.priority || 1,
          backgroundColor: requestData.backgroundColor || "#007cba",
          textColor: requestData.textColor || "#ffffff",
          isActive: requestData.isActive !== false,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        if (requestData.autoTranslate !== false && (newBanner.title || newBanner.subtitle)) {
          try {
            let openaiApiKey = context.env.OPENAI_API_KEY;
            if (!openaiApiKey) {
              const apiKeySetting = await settingsStorage.getSetting("openai_api_key");
              openaiApiKey = apiKeySetting || void 0;
            }
            if (openaiApiKey) {
              const supportedLanguages = ["de", "fr", "es", "it", "pt", "nl", "da", "no", "fi", "tr", "pl", "ru"];
              const translationPromises = [];
              if (newBanner.title) {
                translationPromises.push(
                  fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                      "Authorization": `Bearer ${openaiApiKey}`,
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                      model: "gpt-4o",
                      messages: [
                        {
                          role: "system",
                          content: "You are a professional translator specializing in marketing content. Provide accurate, culturally appropriate translations that maintain the marketing impact of the original text."
                        },
                        {
                          role: "user",
                          content: `Translate the following countdown banner title into multiple languages.

Original text (English): "${newBanner.title}"
Context: Countdown banner title for limited-time promotion on Chrome extension website
Target languages: ${supportedLanguages.map((code) => `${code}: ${{ "de": "German", "fr": "French", "es": "Spanish", "it": "Italian", "pt": "Portuguese", "nl": "Dutch", "da": "Danish", "no": "Norwegian", "fi": "Finnish", "tr": "Turkish", "pl": "Polish", "ru": "Russian" }[code]}`).join(", ")}
Tone: Urgent/promotional tone

Requirements:
- Maintain the urgent/promotional tone
- Keep the same emotional impact as the original
- Adapt cultural nuances appropriately for each target market
- Keep translations concise and impactful for banner display
- Ensure translations sound natural to native speakers

Respond with a JSON object where keys are language codes (${supportedLanguages.join(", ")}) and values are the translated text.

Example format:
{
  "de": "German translation here",
  "fr": "French translation here"
}`
                        }
                      ],
                      response_format: { type: "json_object" },
                      temperature: 0.3,
                      max_tokens: 1e3
                    })
                  })
                );
              }
              if (newBanner.subtitle) {
                translationPromises.push(
                  fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                      "Authorization": `Bearer ${openaiApiKey}`,
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                      model: "gpt-4o",
                      messages: [
                        {
                          role: "system",
                          content: "You are a professional translator specializing in marketing content. Provide accurate, culturally appropriate translations that maintain the marketing impact of the original text."
                        },
                        {
                          role: "user",
                          content: `Translate the following countdown banner subtitle into multiple languages.

Original text (English): "${newBanner.subtitle}"
Context: Countdown banner subtitle describing promotional offer on Chrome extension website
Target languages: ${supportedLanguages.map((code) => `${code}: ${{ "de": "German", "fr": "French", "es": "Spanish", "it": "Italian", "pt": "Portuguese", "nl": "Dutch", "da": "Danish", "no": "Norwegian", "fi": "Finnish", "tr": "Turkish", "pl": "Polish", "ru": "Russian" }[code]}`).join(", ")}
Tone: Marketing/promotional tone

Requirements:
- Maintain the marketing/promotional tone
- Keep the same emotional impact as the original
- Adapt cultural nuances appropriately for each target market
- Keep translations concise and impactful for banner display
- Ensure translations sound natural to native speakers

Respond with a JSON object where keys are language codes (${supportedLanguages.join(", ")}) and values are the translated text.

Example format:
{
  "de": "German translation here",
  "fr": "French translation here"
}`
                        }
                      ],
                      response_format: { type: "json_object" },
                      temperature: 0.3,
                      max_tokens: 1e3
                    })
                  })
                );
              }
              const responses = await Promise.all(translationPromises);
              const translations = {};
              if (responses[0] && responses[0].ok) {
                const titleData = await responses[0].json();
                const titleTranslations = JSON.parse(titleData.choices[0]?.message?.content || "{}");
                translations.titleTranslations = titleTranslations;
              }
              if (responses[1] && responses[1].ok) {
                const subtitleData = await responses[1].json();
                const subtitleTranslations = JSON.parse(subtitleData.choices[0]?.message?.content || "{}");
                translations.subtitleTranslations = subtitleTranslations;
              }
              Object.assign(newBanner, translations);
              console.log("Auto-translated banner to languages:", Object.keys(translations));
            }
          } catch (translationError) {
            console.warn("Auto-translation failed, continuing without translations:", translationError);
          }
        }
        const existingBannersData = await settingsStorage.getSetting("countdown_banners");
        const existingBanners = existingBannersData ? JSON.parse(existingBannersData) : [];
        existingBanners.push(newBanner);
        await settingsStorage.setSetting("countdown_banners", JSON.stringify(existingBanners));
        console.log("Created countdown banner:", newBanner.id);
        return new Response(JSON.stringify({ banner: newBanner }), {
          status: 201,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Error creating countdown banner:", error);
        return new Response(JSON.stringify({
          error: "Failed to create countdown banner",
          details: error instanceof Error ? error.message : "Unknown error"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestPost");
    onRequestPut9 = /* @__PURE__ */ __name(async (context) => {
      try {
        const settingsStorage = new SettingsStorage(context.env.DB);
        const requestData = await context.request.json();
        const bannerId = requestData.id;
        if (!bannerId) {
          return new Response(JSON.stringify({ error: "Banner ID is required" }), {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        console.log("Updating countdown banner:", bannerId);
        const existingBannersData = await settingsStorage.getSetting("countdown_banners");
        const existingBanners = existingBannersData ? JSON.parse(existingBannersData) : [];
        const bannerIndex = existingBanners.findIndex((banner) => banner.id === bannerId);
        if (bannerIndex === -1) {
          return new Response(JSON.stringify({ error: "Banner not found" }), {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        existingBanners[bannerIndex] = {
          ...existingBanners[bannerIndex],
          ...requestData,
          targetPrice: requestData.targetPrice ? parseFloat(requestData.targetPrice) : existingBanners[bannerIndex].targetPrice,
          originalPrice: requestData.originalPrice ? parseFloat(requestData.originalPrice) : existingBanners[bannerIndex].originalPrice,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        await settingsStorage.setSetting("countdown_banners", JSON.stringify(existingBanners));
        console.log("Updated countdown banner:", bannerId);
        return new Response(JSON.stringify({ banner: existingBanners[bannerIndex] }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Error updating countdown banner:", error);
        return new Response(JSON.stringify({
          error: "Failed to update countdown banner",
          details: error instanceof Error ? error.message : "Unknown error"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestPut");
    onRequestDelete4 = /* @__PURE__ */ __name(async (context) => {
      try {
        const settingsStorage = new SettingsStorage(context.env.DB);
        const url = new URL(context.request.url);
        const bannerId = url.searchParams.get("id");
        if (!bannerId) {
          return new Response(JSON.stringify({ error: "Banner ID is required" }), {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        console.log("Deleting countdown banner:", bannerId);
        const existingBannersData = await settingsStorage.getSetting("countdown_banners");
        const existingBanners = existingBannersData ? JSON.parse(existingBannersData) : [];
        const updatedBanners = existingBanners.filter((banner) => banner.id !== bannerId);
        if (updatedBanners.length === existingBanners.length) {
          return new Response(JSON.stringify({ error: "Banner not found" }), {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        await settingsStorage.setSetting("countdown_banners", JSON.stringify(updatedBanners));
        console.log("Deleted countdown banner:", bannerId);
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Error deleting countdown banner:", error);
        return new Response(JSON.stringify({
          error: "Failed to delete countdown banner",
          details: error instanceof Error ? error.message : "Unknown error"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestDelete");
  }
});

// api/admin/create-default-banner.ts
var onRequestPost6, onRequestOptions16;
var init_create_default_banner = __esm({
  "api/admin/create-default-banner.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    onRequestPost6 = /* @__PURE__ */ __name(async ({ env }) => {
      try {
        const existingBanner = await env.DB.prepare(`
      SELECT id FROM countdown_banners 
      WHERE isActive = 1 
      LIMIT 1
    `).first();
        if (existingBanner) {
          return new Response(JSON.stringify({
            success: true,
            message: "Active banner already exists",
            bannerId: existingBanner.id
          }), {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        const endDate = /* @__PURE__ */ new Date();
        endDate.setDate(endDate.getDate() + 7);
        await env.DB.prepare(`
      UPDATE countdown_banners 
      SET targetPrice = '1.00' 
      WHERE id = 1
    `).run();
        const result = await env.DB.prepare(`
      INSERT INTO countdown_banners (
        titleEn, subtitleEn, titleTranslations, subtitleTranslations,
        targetPrice, originalPrice, endDateTime, isEnabled, backgroundColor, textColor, priority
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
          "Limited Time Offer!",
          "Get OCUS Job Hunter Extension at Special Price",
          "{}",
          "{}",
          "1.00",
          "299.99",
          endDate.toISOString(),
          1,
          "#FF6B35",
          "#FFFFFF",
          1
        ).run();
        return new Response(JSON.stringify({
          success: true,
          message: "Default countdown banner created successfully",
          bannerId: result.meta.last_row_id
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Error creating default banner:", error);
        return new Response(JSON.stringify({
          success: false,
          error: "Failed to create default banner",
          details: error instanceof Error ? error.message : "Unknown error"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestPost");
    onRequestOptions16 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
  }
});

// api/admin/customers.ts
var onRequestGet17, onRequestOptions17;
var init_customers = __esm({
  "api/admin/customers.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    init_user_storage();
    onRequestGet17 = /* @__PURE__ */ __name(async ({ env }) => {
      try {
        const userStorage = new UserStorage(env.DB);
        await userStorage.initializeUsers();
        const customers = await userStorage.getAllCustomers();
        return new Response(JSON.stringify({
          success: true,
          customers
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Failed to get customers:", error);
        return new Response(JSON.stringify({
          success: false,
          message: "Failed to load customers"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestGet");
    onRequestOptions17 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
  }
});

// api/admin/dashboard-features.ts
var FeatureStorage, onRequestGet18, onRequestPut10, onRequestOptions18;
var init_dashboard_features = __esm({
  "api/admin/dashboard-features.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    FeatureStorage = class {
      static {
        __name(this, "FeatureStorage");
      }
      db;
      constructor(db) {
        this.db = db;
      }
      async getFeatureStates() {
        try {
          const result = await this.db.prepare(`
        SELECT feature_name, is_enabled 
        FROM dashboard_features
      `).all();
          const states = {
            "affiliate-program": true,
            "analytics": true,
            "billing": true
          };
          if (result.results) {
            result.results.forEach((row) => {
              states[row.feature_name] = Boolean(row.is_enabled);
            });
          }
          return states;
        } catch (error) {
          console.error("Failed to get feature states:", error);
          return {
            "affiliate-program": true,
            "analytics": true,
            "billing": true
          };
        }
      }
      async updateFeatureState(featureName, isEnabled) {
        try {
          await this.db.prepare(`
        INSERT OR REPLACE INTO dashboard_features (feature_name, is_enabled, updated_at)
        VALUES (?, ?, datetime('now'))
      `).bind(featureName, isEnabled ? 1 : 0).run();
        } catch (error) {
          console.error("Failed to update feature state:", error);
          throw error;
        }
      }
      async initializeFeatures() {
        try {
          await this.db.prepare(`
        CREATE TABLE IF NOT EXISTS dashboard_features (
          feature_name TEXT PRIMARY KEY,
          is_enabled INTEGER DEFAULT 1,
          updated_at TEXT DEFAULT (datetime('now'))
        )
      `).run();
          const defaultFeatures = ["affiliate-program", "analytics", "billing"];
          for (const feature of defaultFeatures) {
            await this.db.prepare(`
          INSERT OR IGNORE INTO dashboard_features (feature_name, is_enabled)
          VALUES (?, 1)
        `).bind(feature).run();
          }
        } catch (error) {
          console.error("Failed to initialize features:", error);
        }
      }
    };
    onRequestGet18 = /* @__PURE__ */ __name(async ({ env }) => {
      try {
        const storage = new FeatureStorage(env.DB);
        await storage.initializeFeatures();
        const states = await storage.getFeatureStates();
        const features = [
          {
            id: "affiliate-program",
            name: "Affiliate Program",
            description: "Controls visibility of referral system and commission tracking",
            isEnabled: states["affiliate-program"],
            category: "monetization"
          },
          {
            id: "analytics",
            name: "Analytics",
            description: "Controls visibility of usage statistics and performance metrics",
            isEnabled: states["analytics"],
            category: "insights"
          },
          {
            id: "billing",
            name: "Billing",
            description: "Controls visibility of payment history and subscription management",
            isEnabled: states["billing"],
            category: "payments"
          }
        ];
        return new Response(JSON.stringify(features), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Error getting features:", error);
        return new Response(JSON.stringify([]), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestGet");
    onRequestPut10 = /* @__PURE__ */ __name(async ({ request, env }) => {
      try {
        const { featureName, isEnabled } = await request.json();
        const storage = new FeatureStorage(env.DB);
        await storage.updateFeatureState(featureName, isEnabled);
        return new Response(JSON.stringify({
          success: true,
          message: `Feature ${featureName} updated successfully`,
          feature: {
            id: featureName,
            isEnabled
          }
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          message: "Failed to update feature"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestPut");
    onRequestOptions18 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
  }
});

// api/admin/fix-banner-price.ts
var onRequestPost7;
var init_fix_banner_price = __esm({
  "api/admin/fix-banner-price.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    onRequestPost7 = /* @__PURE__ */ __name(async ({ env }) => {
      try {
        const updateResult = await env.DB.prepare(`
      UPDATE countdown_banners 
      SET targetPrice = '1.00'
      WHERE id = 1
    `).run();
        const updatedBanner = await env.DB.prepare(`
      SELECT id, targetPrice, originalPrice FROM countdown_banners WHERE id = 1
    `).first();
        return new Response(JSON.stringify({
          success: true,
          message: "Banner price updated to \u20AC1.00",
          updateResult: {
            success: updateResult.success,
            meta: updateResult.meta
          },
          banner: updatedBanner
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          error: "Failed to update banner price",
          details: String(error)
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestPost");
  }
});

// api/admin/fix-premium-users.ts
var onRequestPost8;
var init_fix_premium_users = __esm({
  "api/admin/fix-premium-users.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    onRequestPost8 = /* @__PURE__ */ __name(async ({ request, env }) => {
      try {
        const body = await request.json();
        if (body.adminKey !== "fix-premium-2024") {
          return new Response(JSON.stringify({
            success: false,
            message: "Invalid admin key"
          }), {
            status: 403,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        if (!env.DB) {
          return new Response(JSON.stringify({
            success: false,
            message: "Database not available"
          }), {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        const results = {
          usersChecked: 0,
          customersChecked: 0,
          usersFixed: 0,
          customersFixed: 0,
          errors: []
        };
        const customersWithOrders = await env.DB.prepare(`
      SELECT DISTINCT c.id, c.email, c.name, c.is_premium, c.extension_activated,
             COUNT(o.id) as orderCount, SUM(o.final_amount) as totalPaid
      FROM customers c
      JOIN orders o ON c.id = o.customer_id
      WHERE o.status = 'completed' AND o.final_amount > 0
      GROUP BY c.id, c.email, c.name, c.is_premium, c.extension_activated
    `).all();
        console.log("Found customers with completed orders:", customersWithOrders.results?.length);
        for (const customer of customersWithOrders.results || []) {
          results.customersChecked++;
          const needsUpdate = customer.is_premium !== 1 || customer.extension_activated !== 1;
          if (needsUpdate) {
            try {
              await env.DB.prepare(`
            UPDATE customers 
            SET is_premium = 1, extension_activated = 1, premium_activated_at = datetime('now')
            WHERE id = ?
          `).bind(customer.id).run();
              results.customersFixed++;
              console.log(`Fixed customer ${customer.email} (ID: ${customer.id})`);
            } catch (error) {
              results.errors.push(`Failed to fix customer ${customer.email}: ${error.message}`);
            }
          }
        }
        const usersWithOrders = await env.DB.prepare(`
      SELECT DISTINCT u.id, u.email, u.name, u.is_premium, u.extension_activated,
             COUNT(o.id) as orderCount, SUM(o.final_amount) as totalPaid
      FROM users u
      JOIN orders o ON u.email = o.customer_email
      WHERE o.status = 'completed' AND o.final_amount > 0
      GROUP BY u.id, u.email, u.name, u.is_premium, u.extension_activated
    `).all();
        console.log("Found users with completed orders:", usersWithOrders.results?.length);
        for (const user of usersWithOrders.results || []) {
          results.usersChecked++;
          const needsUpdate = user.is_premium !== 1 || user.extension_activated !== 1;
          if (needsUpdate) {
            try {
              await env.DB.prepare(`
            UPDATE users 
            SET is_premium = 1, extension_activated = 1, premium_activated_at = datetime('now')
            WHERE id = ?
          `).bind(user.id).run();
              results.usersFixed++;
              console.log(`Fixed user ${user.email} (ID: ${user.id})`);
            } catch (error) {
              results.errors.push(`Failed to fix user ${user.email}: ${error.message}`);
            }
          }
        }
        const customersNeedingCodes = await env.DB.prepare(`
      SELECT c.id, c.email
      FROM customers c
      WHERE c.is_premium = 1 AND c.extension_activated = 1
      AND NOT EXISTS (
        SELECT 1 FROM activation_codes ac WHERE ac.customer_id = c.id
      )
    `).all();
        let codesCreated = 0;
        for (const customer of customersNeedingCodes.results || []) {
          try {
            const activationCode = `OCUS-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
            await env.DB.prepare(`
          INSERT INTO activation_codes (customer_id, code, created_at)
          VALUES (?, ?, datetime('now'))
        `).bind(customer.id, activationCode).run();
            codesCreated++;
            console.log(`Created activation code for customer ${customer.email}`);
          } catch (error) {
            results.errors.push(`Failed to create activation code for ${customer.email}: ${error.message}`);
          }
        }
        return new Response(JSON.stringify({
          success: true,
          message: "Premium activation fix completed",
          results: {
            ...results,
            activationCodesCreated: codesCreated
          }
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Error fixing premium users:", error);
        return new Response(JSON.stringify({
          success: false,
          message: error.message
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestPost");
  }
});

// api/admin/fix-purchased-users.ts
function json7(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
var onRequestPost9;
var init_fix_purchased_users = __esm({
  "api/admin/fix-purchased-users.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    __name(json7, "json");
    onRequestPost9 = /* @__PURE__ */ __name(async ({ request, env }) => {
      try {
        const body = await request.json();
        const { emails } = body;
        if (!emails || !Array.isArray(emails)) {
          return json7({ success: false, message: "Array of emails required" }, 400);
        }
        if (!env.DB) {
          return json7({ success: false, message: "Database not available" }, 500);
        }
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const results = [];
        for (const email of emails) {
          try {
            const user = await env.DB.prepare(`
          SELECT id, email, name FROM users WHERE email = ?
        `).bind(email).first();
            if (user) {
              await env.DB.prepare(`
            UPDATE users 
            SET is_premium = 1,
                extension_activated = 1,
                premium_activated_at = ?
            WHERE email = ?
          `).bind(now, email).run();
              results.push({
                email,
                status: "updated",
                message: "User premium status activated"
              });
            } else {
              results.push({
                email,
                status: "not_found",
                message: "User not found in users table"
              });
            }
          } catch (error) {
            results.push({
              email,
              status: "error",
              message: error.message
            });
          }
        }
        return json7({
          success: true,
          message: "Batch update completed",
          results
        });
      } catch (error) {
        console.error("Error fixing purchased users:", error);
        return json7({
          success: false,
          message: error.message
        }, 500);
      }
    }, "onRequestPost");
  }
});

// api/admin/force-update-price.ts
var onRequestGet19;
var init_force_update_price = __esm({
  "api/admin/force-update-price.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    onRequestGet19 = /* @__PURE__ */ __name(async ({ env }) => {
      try {
        const updateResult = await env.DB.prepare(`
      UPDATE countdown_banners 
      SET targetPrice = '1.00'
      WHERE id = 1
    `).run();
        const banner = await env.DB.prepare(`
      SELECT id, targetPrice, originalPrice FROM countdown_banners WHERE id = 1
    `).first();
        return new Response(JSON.stringify({
          success: true,
          message: "Banner price force updated to \u20AC1.00",
          updateResult: {
            success: updateResult.success,
            meta: updateResult.meta
          },
          currentBanner: banner
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          error: "Failed to update banner price",
          details: String(error)
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestGet");
  }
});

// api/admin/invoices.ts
var onRequestGet20, onRequestOptions19;
var init_invoices2 = __esm({
  "api/admin/invoices.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    onRequestGet20 = /* @__PURE__ */ __name(async (context) => {
      try {
        const invoicesQuery = `
      SELECT 
        i.id,
        i.invoice_number,
        i.order_id,
        i.customer_id,
        i.amount,
        i.currency,
        i.tax_amount,
        i.status,
        i.invoice_date,
        i.due_date,
        i.paid_at,
        i.created_at,
        u.name as customer_name,
        u.email as customer_email,
        o.product_id,
        o.payment_method
      FROM invoices i
      LEFT JOIN users u ON i.customer_id = u.id
      LEFT JOIN orders o ON i.order_id = o.id
      ORDER BY i.created_at DESC
    `;
        const invoicesResult = await context.env.DB.prepare(invoicesQuery).all();
        return new Response(JSON.stringify(invoicesResult.results || []), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
          }
        });
      } catch (error) {
        console.error("Error fetching admin invoices:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch invoices" }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestGet");
    onRequestOptions19 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
  }
});

// api/admin/login.ts
var onRequestPost10, onRequestOptions20;
var init_login = __esm({
  "api/admin/login.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    onRequestPost10 = /* @__PURE__ */ __name(async ({ request }) => {
      try {
        const { username, password, recaptchaToken } = await request.json();
        if (username === "admin" && password === "admin123") {
          return new Response(JSON.stringify({
            success: true,
            user: {
              id: 1,
              username: "admin",
              role: "admin"
            },
            token: "demo-admin-jwt-token"
          }), {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        return new Response(JSON.stringify({
          success: false,
          message: "Invalid credentials"
        }), {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          message: "Login failed"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestPost");
    onRequestOptions20 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
  }
});

// api/admin/orders.ts
var onRequestGet21, onRequestOptions21;
var init_orders2 = __esm({
  "api/admin/orders.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    onRequestGet21 = /* @__PURE__ */ __name(async ({ env }) => {
      try {
        let orders = [];
        let stats = {
          totalOrders: 0,
          totalRevenue: 0,
          completedOrders: 0,
          pendingOrders: 0
        };
        try {
          const orderResults = await env.DB.prepare(`
        SELECT 
          id, 
          customerEmail, 
          customerName, 
          productId,
          originalAmount, 
          finalAmount, 
          currency, 
          status, 
          paymentMethod,
          downloadToken, 
          downloadCount, 
          maxDownloads, 
          activationCode,
          createdAt, 
          completedAt
        FROM orders 
        ORDER BY createdAt DESC
      `).all();
          orders = orderResults.results || [];
          const statsResult = await env.DB.prepare(`
        SELECT 
          COUNT(*) as totalOrders,
          SUM(CASE WHEN status = 'completed' THEN CAST(finalAmount as REAL) ELSE 0 END) as totalRevenue,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completedOrders,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendingOrders
        FROM orders
      `).first();
          if (statsResult) {
            stats = {
              totalOrders: Number(statsResult.totalOrders) || 0,
              totalRevenue: Number(statsResult.totalRevenue) || 0,
              completedOrders: Number(statsResult.completedOrders) || 0,
              pendingOrders: Number(statsResult.pendingOrders) || 0
            };
          }
        } catch (dbError) {
          console.log("Orders table not found, checking fallback storage:", dbError);
          const settingsResults = await env.DB.prepare(`
        SELECT key, value FROM settings 
        WHERE key LIKE 'order_%'
      `).all();
          const allOrders = [];
          for (const setting of settingsResults.results || []) {
            try {
              const orderData = JSON.parse(setting.value);
              allOrders.push(orderData);
            } catch (parseError) {
              console.log("Error parsing order data:", parseError);
            }
          }
          orders = allOrders.sort((a, b) => {
            const dateA = new Date(a.completedAt || a.createdAt);
            const dateB = new Date(b.completedAt || b.createdAt);
            return dateB.getTime() - dateA.getTime();
          });
          stats.totalOrders = orders.length;
          stats.completedOrders = orders.filter((o) => o.status === "completed").length;
          stats.pendingOrders = orders.filter((o) => o.status === "pending").length;
          stats.totalRevenue = orders.filter((o) => o.status === "completed").reduce((sum, o) => sum + (parseFloat(o.finalAmount) || 0), 0);
        }
        return new Response(JSON.stringify({
          success: true,
          orders,
          stats
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Error fetching admin orders:", error);
        return new Response(JSON.stringify({
          success: false,
          error: "Failed to fetch orders",
          details: String(error)
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestGet");
    onRequestOptions21 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
  }
});

// api/admin/payment-settings.ts
var onRequestGet22, onRequestPut11, onRequestOptions22;
var init_payment_settings = __esm({
  "api/admin/payment-settings.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    onRequestGet22 = /* @__PURE__ */ __name(async ({ env }) => {
      try {
        const result = await env.DB.prepare(`
      SELECT key, value FROM settings 
      WHERE key LIKE 'payment_%'
    `).all();
        const settings = {
          stripeEnabled: false,
          paypalEnabled: false,
          stripePublicKey: "",
          stripeSecretKey: "",
          paypalClientId: "",
          paypalClientSecret: "",
          defaultPaymentMethod: "stripe"
        };
        result.results?.forEach((row) => {
          const key = row.key.replace("payment_", "");
          let value = row.value;
          if (value === "true") value = true;
          if (value === "false") value = false;
          settings[key] = value;
        });
        return new Response(JSON.stringify(settings), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Error fetching payment settings:", error);
        const defaultSettings2 = {
          stripeEnabled: false,
          paypalEnabled: false,
          stripePublicKey: "",
          stripeSecretKey: "",
          paypalClientId: "",
          paypalClientSecret: "",
          defaultPaymentMethod: "stripe"
        };
        return new Response(JSON.stringify(defaultSettings2), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestGet");
    onRequestPut11 = /* @__PURE__ */ __name(async ({ request, env }) => {
      try {
        const settings = await request.json();
        const settingsToSave = [
          { key: "payment_stripeEnabled", value: String(settings.stripeEnabled || false) },
          { key: "payment_paypalEnabled", value: String(settings.paypalEnabled || false) },
          { key: "payment_stripePublicKey", value: settings.stripePublicKey || "" },
          { key: "payment_stripeSecretKey", value: settings.stripeSecretKey || "" },
          { key: "payment_paypalClientId", value: settings.paypalClientId || "" },
          { key: "payment_paypalClientSecret", value: settings.paypalClientSecret || "" },
          { key: "payment_defaultPaymentMethod", value: settings.defaultPaymentMethod || "stripe" }
        ];
        await env.DB.batch([
          // First, delete existing payment settings
          env.DB.prepare(`DELETE FROM settings WHERE key LIKE 'payment_%'`),
          // Then insert new settings
          ...settingsToSave.map(
            (setting) => env.DB.prepare(`INSERT INTO settings (key, value) VALUES (?, ?)`).bind(setting.key, setting.value)
          )
        ]);
        return new Response(JSON.stringify({
          success: true,
          message: "Payment settings saved successfully",
          settings
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Error saving payment settings:", error);
        return new Response(JSON.stringify({
          success: false,
          message: "Failed to save payment settings",
          error: error instanceof Error ? error.message : "Unknown error"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestPut");
    onRequestOptions22 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
  }
});

// api/admin/pricing.ts
async function onRequestGet23(context) {
  const { env } = context;
  try {
    const selectQuery = `SELECT * FROM products WHERE id = 1 AND isActive = 1`;
    const result = await env.DB.prepare(selectQuery).first();
    if (!result) {
      return new Response(JSON.stringify({
        id: 1,
        name: "OCUS Job Hunter Extension",
        price: "250.00",
        beforePrice: null
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }
    return new Response(JSON.stringify({
      id: result.id,
      name: result.name,
      price: result.price.toString(),
      beforePrice: result.beforePrice ? result.beforePrice.toString() : null
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  } catch (error) {
    console.error("Error fetching pricing:", error);
    return new Response(JSON.stringify({
      message: "Error fetching pricing: " + error.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }
}
async function onRequestPut12(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const { price, beforePrice } = body;
    if (!price || price <= 0) {
      return new Response(JSON.stringify({ message: "Valid price is required" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }
    if (beforePrice && beforePrice <= price) {
      return new Response(JSON.stringify({ message: "Before price must be higher than current price" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }
    const updateQuery = `
      INSERT OR REPLACE INTO products (id, name, price, beforePrice, updatedAt)
      VALUES (1, 'OCUS Job Hunter Extension', ?, ?, datetime('now'))
    `;
    await env.DB.prepare(updateQuery).bind(price, beforePrice || null).run();
    const selectQuery = `SELECT * FROM products WHERE id = 1`;
    const result = await env.DB.prepare(selectQuery).first();
    return new Response(JSON.stringify({
      success: true,
      product: result,
      message: "Pricing updated successfully"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  } catch (error) {
    console.error("Error updating pricing:", error);
    return new Response(JSON.stringify({ message: "Error updating pricing: " + error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }
}
async function onRequestOptions23(context) {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
var init_pricing = __esm({
  "api/admin/pricing.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    __name(onRequestGet23, "onRequestGet");
    __name(onRequestPut12, "onRequestPut");
    __name(onRequestOptions23, "onRequestOptions");
  }
});

// api/admin/reset-db.ts
function toD1Batch(db, sql) {
  return sql.split(";").filter((query) => query.trim() !== "").map((query) => db.prepare(query));
}
var SCHEMA_SQL, onRequestPost11, onRequestOptions24;
var init_reset_db = __esm({
  "api/admin/reset-db.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    SCHEMA_SQL = `-- D1 Database Schema for OCUS Ticket System
-- Run: wrangler d1 execute ocus-tickets --file=./functions/schema.sql

-- Drop existing tables if they exist (for development)
DROP TABLE IF EXISTS ticket_messages;
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS countdown_banners;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS auth_settings;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS activation_codes;

CREATE TABLE IF NOT EXISTS tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  assigned_to_user_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT,
  archived_at TEXT
);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  is_from_customer BOOLEAN NOT NULL DEFAULT 1,
  sender_name TEXT NOT NULL,
  sender_email TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);

-- Countdown Banners Table
CREATE TABLE IF NOT EXISTS countdown_banners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  titleTranslations TEXT,
  subtitleTranslations TEXT,
  targetPrice REAL NOT NULL,
  originalPrice REAL,
  endDate TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 0,
  backgroundColor TEXT NOT NULL DEFAULT '#000000',
  textColor TEXT NOT NULL DEFAULT '#ffffff',
  isActive BOOLEAN NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL DEFAULT 'OCUS Job Hunter Extension',
  price REAL NOT NULL,
  beforePrice REAL,
  description TEXT,
  isActive BOOLEAN NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Insert default product if not exists
INSERT OR IGNORE INTO products (id, name, price, beforePrice) 
VALUES (1, 'OCUS Job Hunter Extension', 250.00, NULL);

-- Auth Settings Table
CREATE TABLE IF NOT EXISTS auth_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  google_enabled BOOLEAN DEFAULT 0,
  google_client_id TEXT,
  google_client_secret TEXT,
  facebook_enabled BOOLEAN DEFAULT 0,
  facebook_app_id TEXT,
  facebook_app_secret TEXT,
  github_enabled BOOLEAN DEFAULT 0,
  github_client_id TEXT,
  github_client_secret TEXT,
  recaptcha_enabled BOOLEAN DEFAULT 0,
  recaptcha_site_key TEXT,
  recaptcha_secret_key TEXT,
  recaptcha_mode TEXT DEFAULT 'v2',
  recaptcha_customer_enabled BOOLEAN DEFAULT 0,
  recaptcha_admin_enabled BOOLEAN DEFAULT 0,
  jwt_secret TEXT DEFAULT 'demo-jwt-secret',
  session_timeout INTEGER DEFAULT 3600,
  stripe_enabled BOOLEAN DEFAULT 0,
  stripe_public_key TEXT,
  stripe_secret_key TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Insert default auth settings if not exists
INSERT OR IGNORE INTO auth_settings (id) VALUES (1);

-- Generic Settings Table for flexible key-value storage
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Orders/Purchases Table
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customerId INTEGER,
  customerEmail TEXT NOT NULL,
  customerName TEXT NOT NULL,
  productId INTEGER NOT NULL,
  productName TEXT NOT NULL,
  originalAmount REAL NOT NULL,
  finalAmount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'pending',
  paymentMethod TEXT NOT NULL DEFAULT 'stripe',
  paymentIntentId TEXT,
  downloadToken TEXT UNIQUE,
  downloadCount INTEGER DEFAULT 0,
  maxDownloads INTEGER DEFAULT 5,
  activationCode TEXT,
  invoiceNumber TEXT UNIQUE,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  completedAt TEXT,
  FOREIGN KEY (productId) REFERENCES products(id)
);

-- Customers Table (renamed from users for clarity)
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  hashedPassword TEXT,
  isActive BOOLEAN DEFAULT 1,
  isPremium BOOLEAN DEFAULT 0, -- Deprecated, use extension_activated
  extension_activated BOOLEAN DEFAULT 0,
  registrationDate TEXT NOT NULL DEFAULT (datetime('now')),
  lastLoginAt TEXT,
  activationToken TEXT,
  passwordResetToken TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create a view for backward compatibility if 'users' is still used elsewhere
CREATE VIEW IF NOT EXISTS users AS SELECT * FROM customers;

CREATE TABLE IF NOT EXISTS activation_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    code TEXT NOT NULL UNIQUE,
    is_used BOOLEAN DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  orderId INTEGER NOT NULL,
  customerId INTEGER NOT NULL,
  invoiceNumber TEXT NOT NULL UNIQUE,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  taxAmount REAL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'unpaid', -- unpaid, paid, void
  invoiceDate TEXT NOT NULL DEFAULT (datetime('now')),
  dueDate TEXT,
  paidAt TEXT,
  pdfUrl TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (orderId) REFERENCES orders(id),
  FOREIGN KEY (customerId) REFERENCES customers(id)
);


-- Index for settings lookup
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tickets_customer_email ON tickets(customer_email);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_created_at ON ticket_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_countdown_banners_active ON countdown_banners(isActive);
CREATE INDEX IF NOT EXISTS idx_countdown_banners_priority ON countdown_banners(priority);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(isActive);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customerEmail);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(createdAt);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_active ON customers(isActive);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customerId);
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(orderId);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customerId);
`;
    __name(toD1Batch, "toD1Batch");
    onRequestPost11 = /* @__PURE__ */ __name(async (context) => {
      const { request, env } = context;
      const adminSecret = request.headers.get("X-Admin-Secret");
      if (adminSecret !== "ocus-power-secret") {
        return new Response("Unauthorized", { status: 401 });
      }
      try {
        if (!env.DB) {
          return new Response("Database not available", { status: 500 });
        }
        const statements = toD1Batch(env.DB, SCHEMA_SQL);
        await env.DB.batch(statements);
        return new Response("Database reset and initialized successfully.", {
          status: 200,
          headers: { "Content-Type": "text/plain" }
        });
      } catch (error) {
        console.error("Database reset failed:", error);
        return new Response(`Database reset failed: ${error.message}`, {
          status: 500,
          headers: { "Content-Type": "text/plain" }
        });
      }
    }, "onRequestPost");
    onRequestOptions24 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, X-Admin-Secret"
        }
      });
    }, "onRequestOptions");
  }
});

// api/admin/seo-settings.ts
var onRequestGet24, onRequestPut13, onRequestPatch, onRequestOptions25;
var init_seo_settings = __esm({
  "api/admin/seo-settings.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    init_settings_storage();
    onRequestGet24 = /* @__PURE__ */ __name(async ({ env }) => {
      try {
        if (!env.DB) {
          return new Response(JSON.stringify({
            success: false,
            message: "Database not available"
          }), {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        const settingsStorage = new SettingsStorage(env.DB);
        await settingsStorage.initializeSettings();
        const title = await settingsStorage.getSetting("seo_title") || "OCUS Job Hunter";
        const description = await settingsStorage.getSetting("seo_description") || "Automated job application Chrome extension";
        const keywords = await settingsStorage.getSetting("seo_keywords") || "job hunting, automation, chrome extension";
        const coverImage = await settingsStorage.getSetting("seo_cover_image") || "";
        const logo = await settingsStorage.getSetting("seo_logo") || "";
        const favicon = await settingsStorage.getSetting("seo_favicon") || "";
        console.log("GET SEO Settings - Retrieved from DB:", {
          title,
          description,
          keywords,
          coverImage: coverImage ? "Has image data" : "No image",
          logo: logo ? "Has logo data" : "No logo",
          favicon: favicon ? "Has favicon data" : "No favicon"
        });
        return new Response(JSON.stringify({
          success: true,
          title,
          description,
          keywords,
          coverImage,
          logo,
          favicon
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Failed to get SEO settings:", error);
        return new Response(JSON.stringify({
          success: false,
          message: "Failed to load SEO settings"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestGet");
    onRequestPut13 = /* @__PURE__ */ __name(async ({ request, env }) => {
      try {
        if (!env.DB) {
          return new Response(JSON.stringify({
            success: false,
            message: "Database not available"
          }), {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        const formData = await request.formData();
        const settingsStorage = new SettingsStorage(env.DB);
        await settingsStorage.initializeSettings();
        console.log("FormData keys:", Array.from(formData.keys()));
        console.log("FormData entries:");
        for (const [key, value] of formData.entries()) {
          console.log(`${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
        }
        const title = formData.get("title")?.toString();
        const description = formData.get("description")?.toString();
        const keywords = formData.get("keywords")?.toString();
        if (title) {
          await settingsStorage.setSetting("seo_title", title);
        }
        if (description) {
          await settingsStorage.setSetting("seo_description", description);
        }
        if (keywords) {
          await settingsStorage.setSetting("seo_keywords", keywords);
        }
        const coverImageFile = formData.get("coverImage");
        const logoFile = formData.get("logo");
        const faviconFile = formData.get("favicon");
        console.log("File uploads check:", {
          coverImage: coverImageFile ? `${coverImageFile.name} (${coverImageFile.size} bytes)` : "null",
          logo: logoFile ? `${logoFile.name} (${logoFile.size} bytes)` : "null",
          favicon: faviconFile ? `${faviconFile.name} (${faviconFile.size} bytes)` : "null"
        });
        if (coverImageFile && coverImageFile.size > 0) {
          console.log("Processing cover image:", coverImageFile.name, coverImageFile.type, coverImageFile.size);
          const arrayBuffer = await coverImageFile.arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          const dataUrl = `data:${coverImageFile.type};base64,${base64}`;
          console.log("Saving cover image to DB, data URL length:", dataUrl.length);
          await settingsStorage.setSetting("seo_cover_image", dataUrl);
          console.log("Cover image saved successfully");
        }
        if (logoFile && logoFile.size > 0) {
          const arrayBuffer = await logoFile.arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          const dataUrl = `data:${logoFile.type};base64,${base64}`;
          await settingsStorage.setSetting("seo_logo", dataUrl);
        }
        if (faviconFile && faviconFile.size > 0) {
          const arrayBuffer = await faviconFile.arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          const dataUrl = `data:${faviconFile.type};base64,${base64}`;
          await settingsStorage.setSetting("seo_favicon", dataUrl);
        }
        console.log("SEO settings updated successfully");
        return new Response(JSON.stringify({
          success: true,
          message: "SEO settings updated successfully"
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Failed to update SEO settings:", error);
        return new Response(JSON.stringify({
          success: false,
          message: `Failed to update SEO settings: ${error.message || error}`
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestPut");
    onRequestPatch = /* @__PURE__ */ __name(async ({ request, env }) => {
      try {
        if (!env.DB) {
          return new Response(JSON.stringify({
            success: false,
            message: "Database not available"
          }), {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        const data = await request.json();
        const settingsStorage = new SettingsStorage(env.DB);
        await settingsStorage.initializeSettings();
        if (data.title) {
          await settingsStorage.setSetting("seo_title", data.title);
        }
        if (data.description) {
          await settingsStorage.setSetting("seo_description", data.description);
        }
        if (data.keywords) {
          await settingsStorage.setSetting("seo_keywords", data.keywords);
        }
        console.log("SEO text settings updated successfully");
        return new Response(JSON.stringify({
          success: true,
          message: "SEO settings updated successfully"
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Failed to update SEO text settings:", error);
        return new Response(JSON.stringify({
          success: false,
          message: `Failed to update SEO settings: ${error.message || error}`
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestPatch");
    onRequestOptions25 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, PUT, PATCH, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }, "onRequestOptions");
  }
});

// api/admin/stats.ts
var onRequestGet25, onRequestOptions26;
var init_stats = __esm({
  "api/admin/stats.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    onRequestGet25 = /* @__PURE__ */ __name(async () => {
      const stats = {
        totalUsers: 1247,
        activeUsers: 892,
        newUsersToday: 23,
        totalTickets: 156,
        openTickets: 34,
        resolvedTickets: 122,
        revenue: {
          monthly: 15420,
          yearly: 184500,
          growth: 12.5
        },
        userGrowth: [
          { month: "Jan", users: 1100 },
          { month: "Feb", users: 1180 },
          { month: "Mar", users: 1247 }
        ],
        ticketStats: [
          { category: "Technical", count: 45 },
          { category: "Billing", count: 32 },
          { category: "Feature Request", count: 28 },
          { category: "General", count: 51 }
        ],
        recentActivity: [
          { time: "2 min ago", action: "New user registration: john@example.com" },
          { time: "5 min ago", action: "Ticket #156 resolved by support team" },
          { time: "12 min ago", action: "Payment received: $49.99 from user #1234" }
        ]
      };
      return new Response(JSON.stringify(stats), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }, "onRequestGet");
    onRequestOptions26 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
  }
});

// api/admin/sync-banner-price.ts
var onRequestPost12, onRequestOptions27;
var init_sync_banner_price = __esm({
  "api/admin/sync-banner-price.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    init_settings_storage();
    onRequestPost12 = /* @__PURE__ */ __name(async ({ request, env }) => {
      try {
        const requestData = await request.json();
        const { targetPrice } = requestData;
        if (!targetPrice) {
          return new Response(JSON.stringify({ error: "targetPrice is required" }), {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        const settingsStorage = new SettingsStorage(env.DB);
        const bannersData = await settingsStorage.getSetting("countdown_banners");
        let banners = bannersData ? JSON.parse(bannersData) : [];
        if (banners.length === 0) {
          banners = [{
            id: "1",
            title: "Limited Time Offer!",
            subtitle: "Get OCUS Job Hunter Extension at Special Price",
            targetPrice,
            originalPrice: 299.99,
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString(),
            priority: 1,
            backgroundColor: "#FF6B35",
            textColor: "#FFFFFF",
            isActive: true,
            createdAt: (/* @__PURE__ */ new Date()).toISOString(),
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          }];
        } else {
          banners[0].targetPrice = targetPrice;
          banners[0].updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        }
        await settingsStorage.setSetting("countdown_banners", JSON.stringify(banners));
        const updateProductResult = await env.DB.prepare(`
      UPDATE products 
      SET price = ? 
      WHERE id = 1
    `).bind(targetPrice.toString()).run();
        return new Response(JSON.stringify({
          success: true,
          message: "Banner price synced successfully",
          targetPrice
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          error: "Failed to sync banner price",
          details: String(error)
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestPost");
    onRequestOptions27 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
  }
});

// api/admin/tickets.ts
function mapStatus(status) {
  if (status === "in-progress") return "in_progress";
  if (status === "resolved") return "closed";
  return status || "open";
}
var onRequestGet26, onRequestOptions28;
var init_tickets = __esm({
  "api/admin/tickets.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    init_db();
    __name(mapStatus, "mapStatus");
    onRequestGet26 = /* @__PURE__ */ __name(async ({ request, env }) => {
      const expressBase = env?.EXPRESS_API_BASE;
      if (expressBase) {
        const base = expressBase.replace(/\/$/, "");
        const url = `${base}/api/admin/tickets`;
        const headers = {};
        const cookie = request.headers.get("cookie");
        const auth = request.headers.get("authorization");
        if (cookie) headers["cookie"] = cookie;
        if (auth) headers["authorization"] = auth;
        const proxied = await fetch(url, { headers, redirect: "manual" });
        const respHeaders = new Headers(proxied.headers);
        const setCookie = respHeaders.get("set-cookie");
        if (setCookie) {
          const rewritten = setCookie.replace(/;\s*Domain=[^;]+/i, "");
          respHeaders.delete("set-cookie");
          respHeaders.append("set-cookie", rewritten);
        }
        return new Response(proxied.body, { status: proxied.status, headers: respHeaders });
      }
      const storage = new TicketStorage(env.DB);
      const allTickets = await storage.getAllTickets();
      const tickets = allTickets.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: mapStatus(t.status),
        priority: t.priority,
        userId: t.assigned_to_user_id || 0,
        userName: t.customer_name,
        userEmail: t.customer_email,
        createdAt: t.created_at,
        updatedAt: t.updated_at
      }));
      return new Response(JSON.stringify(tickets), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }, "onRequestGet");
    onRequestOptions28 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
  }
});

// api/admin/update-banner-price.ts
var onRequestPost13, onRequestOptions29;
var init_update_banner_price = __esm({
  "api/admin/update-banner-price.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    onRequestPost13 = /* @__PURE__ */ __name(async ({ request, env }) => {
      try {
        const { bannerId, targetPrice } = await request.json();
        const result = await env.DB.prepare(`
      UPDATE countdown_banners 
      SET targetPrice = ? 
      WHERE id = ?
    `).bind(targetPrice.toString(), bannerId).run();
        if (result.changes === 0) {
          return new Response(JSON.stringify({
            success: false,
            error: "Banner not found"
          }), {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        return new Response(JSON.stringify({
          success: true,
          message: "Banner price updated successfully",
          bannerId,
          newPrice: targetPrice
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Error updating banner price:", error);
        return new Response(JSON.stringify({
          success: false,
          error: "Failed to update banner price"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestPost");
    onRequestOptions29 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
  }
});

// api/admin/update-banner-price-direct.ts
var onRequestGet27;
var init_update_banner_price_direct = __esm({
  "api/admin/update-banner-price-direct.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    onRequestGet27 = /* @__PURE__ */ __name(async ({ env }) => {
      try {
        const result = await env.DB.prepare(`
      UPDATE countdown_banners 
      SET targetPrice = '1.00' 
      WHERE id = 1
    `).run();
        const banner = await env.DB.prepare(`
      SELECT * FROM countdown_banners WHERE id = 1
    `).first();
        return new Response(JSON.stringify({
          success: true,
          message: "Banner price updated to \u20AC1.00",
          updated: result.changes > 0,
          banner
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Error updating banner price:", error);
        return new Response(JSON.stringify({
          success: false,
          error: "Failed to update banner price",
          details: error.message
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestGet");
  }
});

// api/admin/update-user-premium.ts
var onRequestPost14;
var init_update_user_premium = __esm({
  "api/admin/update-user-premium.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    onRequestPost14 = /* @__PURE__ */ __name(async ({ request, env }) => {
      try {
        const body = await request.json();
        const { email, adminKey } = body;
        if (adminKey !== "fix-premium-2024") {
          return new Response(JSON.stringify({
            success: false,
            message: "Invalid admin key"
          }), {
            status: 403,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        if (!env.DB) {
          return new Response(JSON.stringify({ success: false, message: "Database not available" }), {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        const results = {
          usersFixed: 0,
          customersFixed: 0,
          errors: []
        };
        if (email) {
          const user = await env.DB.prepare(`
        SELECT id, email, is_premium, extension_activated FROM users WHERE email = ?
      `).bind(email).first();
          if (user) {
            const userOrders = await env.DB.prepare(`
          SELECT COUNT(*) as count FROM orders 
          WHERE customer_email = ? AND status = 'completed' AND final_amount > 0
        `).bind(email).first();
            if (userOrders && userOrders.count > 0) {
              await env.DB.prepare(`
            UPDATE users 
            SET is_premium = 1, extension_activated = 1, premium_activated_at = datetime('now')
            WHERE id = ?
          `).bind(user.id).run();
              results.usersFixed++;
            }
          }
          const customer = await env.DB.prepare(`
        SELECT id, email, is_premium, extension_activated FROM customers WHERE email = ?
      `).bind(email).first();
          if (customer) {
            const customerOrders = await env.DB.prepare(`
          SELECT COUNT(*) as count FROM orders 
          WHERE customer_id = ? AND status = 'completed' AND final_amount > 0
        `).bind(customer.id).first();
            if (customerOrders && customerOrders.count > 0) {
              await env.DB.prepare(`
            UPDATE customers 
            SET is_premium = 1, extension_activated = 1, premium_activated_at = datetime('now')
            WHERE id = ?
          `).bind(customer.id).run();
              results.customersFixed++;
            }
          }
        } else {
          const usersToFix = await env.DB.prepare(`
        SELECT DISTINCT u.id, u.email
        FROM users u
        JOIN orders o ON u.email = o.customer_email
        WHERE o.status = 'completed' AND o.final_amount > 0
        AND (u.is_premium != 1 OR u.extension_activated != 1)
      `).all();
          for (const user of usersToFix.results || []) {
            await env.DB.prepare(`
          UPDATE users 
          SET is_premium = 1, extension_activated = 1, premium_activated_at = datetime('now')
          WHERE id = ?
        `).bind(user.id).run();
            results.usersFixed++;
          }
          const customersToFix = await env.DB.prepare(`
        SELECT DISTINCT c.id, c.email
        FROM customers c
        JOIN orders o ON c.id = o.customer_id
        WHERE o.status = 'completed' AND o.final_amount > 0
        AND (c.is_premium != 1 OR c.extension_activated != 1)
      `).all();
          for (const customer of customersToFix.results || []) {
            await env.DB.prepare(`
          UPDATE customers 
          SET is_premium = 1, extension_activated = 1, premium_activated_at = datetime('now')
          WHERE id = ?
        `).bind(customer.id).run();
            results.customersFixed++;
          }
        }
        return new Response(JSON.stringify({
          success: true,
          message: `Premium activation fix completed`,
          results
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Error fixing premium activation:", error);
        return new Response(JSON.stringify({
          success: false,
          message: error.message
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestPost");
  }
});

// api/admin/users.ts
var onRequestGet28, onRequestOptions30;
var init_users = __esm({
  "api/admin/users.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    onRequestGet28 = /* @__PURE__ */ __name(async ({ env }) => {
      try {
        let users = [];
        let stats = {
          totalUsers: 0,
          activeUsers: 0,
          premiumUsers: 0
        };
        try {
          const userResults = await env.DB.prepare(`
        SELECT 
          u.id, 
          u.email, 
          u.name, 
          u.role,
          u.created_at,
          u.is_premium,
          u.premium_activated_at,
          u.total_spent,
          u.total_orders,
          u.extension_activated,
          COUNT(DISTINCT d.id) as trial_downloads,
          COUNT(DISTINCT o.id) as purchase_count,
          MAX(d.created_at) as last_download,
          MAX(o.created_at) as last_purchase
        FROM users u
        LEFT JOIN user_downloads d ON u.id = d.user_id
        LEFT JOIN orders o ON u.id = o.customer_id AND o.status = 'completed'
        GROUP BY u.id
        ORDER BY u.created_at DESC
      `).all();
          users = userResults.results || [];
          const statsResult = await env.DB.prepare(`
        SELECT 
          COUNT(*) as totalUsers,
          COUNT(CASE WHEN is_premium = 1 THEN 1 END) as premiumUsers,
          COUNT(DISTINCT d.user_id) as trialUsers
        FROM users u
        LEFT JOIN user_downloads d ON u.id = d.user_id
      `).first();
          if (statsResult) {
            stats = {
              totalUsers: Number(statsResult.totalUsers) || 0,
              activeUsers: Number(statsResult.trialUsers) || 0,
              premiumUsers: Number(statsResult.premiumUsers) || 0
            };
          }
        } catch (dbError) {
          console.log("Users table not found, checking fallback storage:", dbError);
          const settingsResults = await env.DB.prepare(`
        SELECT key, value FROM settings 
        WHERE key LIKE 'user_%'
      `).all();
          const allUsers = [];
          for (const setting of settingsResults.results || []) {
            try {
              const userData = JSON.parse(setting.value);
              userData.id = userData.email.replace("@", "_at_").replace(".", "_dot_");
              userData.registrationDate = userData.updatedAt;
              userData.createdAt = userData.updatedAt;
              userData.isActive = true;
              allUsers.push(userData);
            } catch (parseError) {
              console.log("Error parsing user data:", parseError);
            }
          }
          users = allUsers.sort((a, b) => {
            const dateA = new Date(a.updatedAt);
            const dateB = new Date(b.updatedAt);
            return dateB.getTime() - dateA.getTime();
          });
          stats.totalUsers = users.length;
          stats.activeUsers = users.filter((u) => u.isActive).length;
          stats.premiumUsers = users.filter((u) => u.isPremium).length;
        }
        return new Response(JSON.stringify({
          success: true,
          users,
          stats
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Error fetching admin users:", error);
        return new Response(JSON.stringify({
          success: false,
          error: "Failed to fetch users",
          details: String(error)
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestGet");
    onRequestOptions30 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
  }
});

// api/announcement-badge/active.ts
var onRequestOptions31, onRequestGet29;
var init_active = __esm({
  "api/announcement-badge/active.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    init_settings_storage();
    onRequestOptions31 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }, "onRequestOptions");
    onRequestGet29 = /* @__PURE__ */ __name(async (context) => {
      try {
        const settingsStorage = new SettingsStorage(context.env.DB);
        const badgesData = await settingsStorage.getSetting("announcement_badges");
        const badges = badgesData ? JSON.parse(badgesData) : [];
        console.log("Retrieved announcement badges for active endpoint:", badges.length);
        const activeBadge = badges.filter((badge) => badge.isActive).sort((a, b) => b.priority - a.priority)[0];
        if (!activeBadge) {
          return new Response(JSON.stringify(null), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        const frontendBadge = {
          id: activeBadge.id,
          isEnabled: activeBadge.isActive,
          textEn: activeBadge.title,
          textTranslations: activeBadge.textTranslations || {},
          backgroundColor: activeBadge.backgroundColor,
          textColor: activeBadge.textColor,
          priority: activeBadge.priority
        };
        console.log("Returning active badge:", frontendBadge);
        return new Response(JSON.stringify(frontendBadge), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Error fetching active announcement badge:", error);
        return new Response(JSON.stringify({
          error: "Failed to fetch active announcement badge",
          details: error instanceof Error ? error.message : "Unknown error"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestGet");
  }
});

// api/auth/facebook.ts
var onRequestGet30;
var init_facebook = __esm({
  "api/auth/facebook.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    onRequestGet30 = /* @__PURE__ */ __name(async ({ request, env }) => {
      const url = new URL(request.url);
      const code = url.searchParams.get("code");
      try {
        const authSettings = await env.DB.prepare(
          "SELECT facebook_enabled, facebook_app_id, facebook_app_secret FROM auth_settings WHERE id = 1"
        ).first();
        if (!authSettings?.facebook_enabled) {
          return new Response("Facebook login is not enabled.", { status: 400 });
        }
        const { facebook_app_id, facebook_app_secret } = authSettings;
        const redirectUri = `${url.origin}/api/auth/facebook`;
        if (!code) {
          const authUrl = new URL("https://www.facebook.com/v18.0/dialog/oauth");
          authUrl.searchParams.set("client_id", facebook_app_id);
          authUrl.searchParams.set("redirect_uri", redirectUri);
          authUrl.searchParams.set("response_type", "code");
          authUrl.searchParams.set("scope", "email,public_profile");
          return Response.redirect(authUrl.toString(), 302);
        }
        const tokenResponse = await fetch("https://graph.facebook.com/v18.0/oauth/access_token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: facebook_app_id,
            client_secret: facebook_app_secret,
            redirect_uri: redirectUri,
            code
          })
        });
        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          throw new Error(`Failed to get access token: ${errorText}`);
        }
        const tokenData = await tokenResponse.json();
        const userResponse = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${tokenData.access_token}`);
        if (!userResponse.ok) {
          throw new Error("Failed to fetch user data from Facebook.");
        }
        const userData = await userResponse.json();
        if (!userData.email) {
          return new Response("Email not provided by Facebook.", { status: 400 });
        }
        let user = await env.DB.prepare("SELECT id, name, email FROM users WHERE email = ?").bind(userData.email).first();
        if (!user) {
          const now = (/* @__PURE__ */ new Date()).toISOString();
          await env.DB.prepare(
            "INSERT INTO users (email, name, provider, provider_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
          ).bind(userData.email, userData.name, "facebook", userData.id, now, now).run();
          user = await env.DB.prepare("SELECT id, name, email FROM users WHERE email = ?").bind(userData.email).first();
        }
        if (!user) {
          return new Response("Could not create or find user.", { status: 500 });
        }
        const redirectURL = new URL("/dashboard", url.origin);
        redirectURL.searchParams.set("userId", user.id.toString());
        redirectURL.searchParams.set("name", user.name);
        redirectURL.searchParams.set("email", user.email);
        return Response.redirect(redirectURL.toString(), 302);
      } catch (error) {
        console.error("Facebook OAuth Error:", error);
        const errorUrl = new URL("/login", url.origin);
        errorUrl.searchParams.set("error", "oauth_failed");
        errorUrl.searchParams.set("provider", "facebook");
        return Response.redirect(errorUrl.toString(), 302);
      }
    }, "onRequestGet");
  }
});

// api/auth/github.ts
var onRequestGet31;
var init_github = __esm({
  "api/auth/github.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    onRequestGet31 = /* @__PURE__ */ __name(async (context) => {
      const { request, env } = context;
      const url = new URL(request.url);
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      try {
        const authSettings = await env.DB.prepare("SELECT github_enabled, github_client_id, github_client_secret FROM auth_settings WHERE id = 1").first();
        if (!authSettings?.github_enabled) {
          return new Response("GitHub login is not enabled.", { status: 400 });
        }
        if (!authSettings.github_client_id || !authSettings.github_client_secret) {
          return new Response("GitHub client ID or secret is not configured.", { status: 500 });
        }
        if (!code) {
          const authUrl = new URL("https://github.com/login/oauth/authorize");
          authUrl.searchParams.set("client_id", authSettings.github_client_id);
          authUrl.searchParams.set("redirect_uri", `${url.origin}/api/auth/github`);
          authUrl.searchParams.set("scope", "user:email");
          authUrl.searchParams.set("state", state || crypto.randomUUID());
          return Response.redirect(authUrl.toString(), 302);
        }
        const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            client_id: authSettings.github_client_id,
            client_secret: authSettings.github_client_secret,
            code
          })
        });
        const tokenData = await tokenResponse.json();
        if (tokenData.error || !tokenData.access_token) {
          throw new Error(`Failed to get access token: ${tokenData.error_description || "No token returned"}`);
        }
        const userResponse = await fetch("https://api.github.com/user", {
          headers: {
            "Authorization": `Bearer ${tokenData.access_token}`,
            "User-Agent": "OCUS-Job-Hunter"
          }
        });
        const userData = await userResponse.json();
        let userEmail = userData.email;
        if (!userEmail) {
          const emailResponse = await fetch("https://api.github.com/user/emails", {
            headers: {
              "Authorization": `Bearer ${tokenData.access_token}`,
              "User-Agent": "OCUS-Job-Hunter"
            }
          });
          const emails = await emailResponse.json();
          const primaryEmail = emails.find((e) => e.primary && e.verified);
          userEmail = primaryEmail?.email || null;
        }
        if (!userEmail) {
          return new Response("Could not retrieve a verified primary email from GitHub.", { status: 400 });
        }
        let user = await env.DB.prepare("SELECT id, name, email FROM users WHERE github_id = ?").bind(userData.id).first();
        if (!user) {
          const name = userData.name || userData.login;
          const now = (/* @__PURE__ */ new Date()).toISOString();
          await env.DB.prepare(
            "INSERT INTO users (email, name, provider, provider_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
          ).bind(userEmail, name, "github", userData.id, now, now).run();
          user = await env.DB.prepare("SELECT id, name, email FROM users WHERE github_id = ?").bind(userData.id).first();
        }
        if (!user) {
          return new Response("Failed to create or find user.", { status: 500 });
        }
        const redirectUrl = new URL(`${url.origin}/dashboard`);
        redirectUrl.searchParams.set("status", "loggedIn");
        redirectUrl.searchParams.set("userId", user.id.toString());
        redirectUrl.searchParams.set("name", user.name);
        redirectUrl.searchParams.set("email", user.email);
        return Response.redirect(redirectUrl.toString(), 302);
      } catch (error) {
        console.error("GitHub OAuth Error:", error);
        const errorUrl = new URL(`${url.origin}/login`);
        errorUrl.searchParams.set("error", "github_oauth_failed");
        return Response.redirect(errorUrl.toString(), 302);
      }
    }, "onRequestGet");
  }
});

// api/auth/google.ts
var onRequestGet32;
var init_google = __esm({
  "api/auth/google.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    onRequestGet32 = /* @__PURE__ */ __name(async ({ request, env }) => {
      const url = new URL(request.url);
      const code = url.searchParams.get("code");
      try {
        const authSettings = await env.DB.prepare(
          "SELECT google_enabled, google_client_id, google_client_secret FROM auth_settings WHERE id = 1"
        ).first();
        if (!authSettings?.google_enabled) {
          return new Response("Google login is not enabled.", { status: 400 });
        }
        const { google_client_id, google_client_secret } = authSettings;
        const redirectUri = `${url.origin}/api/auth/google`;
        if (!code) {
          const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
          authUrl.searchParams.set("client_id", google_client_id);
          authUrl.searchParams.set("redirect_uri", redirectUri);
          authUrl.searchParams.set("response_type", "code");
          authUrl.searchParams.set("scope", "openid email profile");
          return Response.redirect(authUrl.toString(), 302);
        }
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: google_client_id,
            client_secret: google_client_secret,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
            code
          })
        });
        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          throw new Error(`Failed to get access token: ${errorText}`);
        }
        const tokenData = await tokenResponse.json();
        const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: { "Authorization": `Bearer ${tokenData.access_token}` }
        });
        if (!userResponse.ok) {
          throw new Error("Failed to fetch user data from Google.");
        }
        const userData = await userResponse.json();
        if (!userData.email || !userData.verified_email) {
          return new Response("A verified email is required from Google.", { status: 400 });
        }
        let user = await env.DB.prepare("SELECT id, name, email FROM users WHERE email = ?").bind(userData.email).first();
        if (!user) {
          const now = (/* @__PURE__ */ new Date()).toISOString();
          await env.DB.prepare(
            "INSERT INTO users (email, name, provider, provider_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
          ).bind(userData.email, userData.name, "google", userData.id, now, now).run();
          user = await env.DB.prepare("SELECT id, name, email FROM users WHERE email = ?").bind(userData.email).first();
        }
        if (!user) {
          return new Response("Could not create or find user.", { status: 500 });
        }
        const redirectURL = new URL("/dashboard", url.origin);
        redirectURL.searchParams.set("userId", user.id.toString());
        redirectURL.searchParams.set("name", user.name);
        redirectURL.searchParams.set("email", user.email);
        return Response.redirect(redirectURL.toString(), 302);
      } catch (error) {
        console.error("Google OAuth Error:", error);
        const errorUrl = new URL("/login", url.origin);
        errorUrl.searchParams.set("error", "oauth_failed");
        errorUrl.searchParams.set("provider", "google");
        return Response.redirect(errorUrl.toString(), 302);
      }
    }, "onRequestGet");
  }
});

// api/auth/register.ts
var jsonResponse, onRequestPost15, onRequestOptions32;
var init_register = __esm({
  "api/auth/register.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    init_user_storage();
    jsonResponse = /* @__PURE__ */ __name((body, status) => {
      const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      };
      return new Response(JSON.stringify(body), { status, headers });
    }, "jsonResponse");
    onRequestPost15 = /* @__PURE__ */ __name(async ({ request, env }) => {
      try {
        const { email, password, name } = await request.json();
        if (!email || !password || !name) {
          return jsonResponse({ success: false, message: "Missing required fields." }, 400);
        }
        const userStorage = new UserStorage(env.DB);
        await userStorage.initializeUsers();
        const existingUser = await userStorage.getUserByEmail(email);
        if (existingUser) {
          return jsonResponse({ success: false, message: "An account with this email already exists." }, 409);
        }
        const newUser = await userStorage.createUser(email, password, name);
        const { password: _, ...userResponse } = newUser;
        return jsonResponse({ success: true, message: "Registration successful.", user: userResponse }, 201);
      } catch (error) {
        console.error("Registration Error:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        if (errorMessage.includes("UNIQUE constraint failed")) {
          return jsonResponse({ success: false, message: "An account with this email already exists." }, 409);
        }
        return jsonResponse({ success: false, message: "Registration failed.", error: errorMessage }, 500);
      }
    }, "onRequestPost");
    onRequestOptions32 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
  }
});

// api/countdown-banner/active.ts
var onRequestGet33, onRequestOptions33;
var init_active2 = __esm({
  "api/countdown-banner/active.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    onRequestGet33 = /* @__PURE__ */ __name(async (context) => {
      try {
        const { env } = context;
        const banner = await env.DB.prepare(`
      SELECT * FROM countdown_banners 
      WHERE isActive = 1 
      ORDER BY priority DESC, id ASC 
      LIMIT 1
    `).first();
        try {
          const settingsStorage = new (await Promise.resolve().then(() => (init_settings_storage(), settings_storage_exports))).SettingsStorage(env.DB);
          const bannersData = await settingsStorage.getSetting("countdown_banners");
          if (bannersData) {
            const banners = JSON.parse(bannersData);
            const activeBanner = banners.find((b) => b.isActive);
            if (activeBanner) {
              return new Response(JSON.stringify({
                id: activeBanner.id || 1,
                isEnabled: activeBanner.isActive ? 1 : 0,
                titleEn: activeBanner.title || "Limited Time Offer!",
                subtitleEn: activeBanner.subtitle || "Get OCUS Job Hunter Extension at Special Price",
                titleTranslations: activeBanner.titleTranslations || {},
                subtitleTranslations: activeBanner.subtitleTranslations || {},
                targetPrice: String(activeBanner.targetPrice || "1.00"),
                originalPrice: String(activeBanner.originalPrice || "299.99"),
                endDateTime: activeBanner.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString(),
                backgroundColor: activeBanner.backgroundColor || "#FF6B35",
                textColor: activeBanner.textColor || "#FFFFFF",
                priority: activeBanner.priority || 1
              }), {
                headers: {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*"
                }
              });
            }
          }
        } catch (settingsError) {
          console.warn("Failed to check settings table for banners:", settingsError);
        }
        if (!banner) {
          return new Response(JSON.stringify({ message: "No active countdown banner found" }), {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type"
            }
          });
        }
        let titleTranslations = {};
        let subtitleTranslations = {};
        try {
          if (banner.titleTranslations && typeof banner.titleTranslations === "string") {
            titleTranslations = JSON.parse(banner.titleTranslations);
          }
        } catch (e) {
          console.warn("Failed to parse titleTranslations:", e);
        }
        try {
          if (banner.subtitleTranslations && typeof banner.subtitleTranslations === "string") {
            subtitleTranslations = JSON.parse(banner.subtitleTranslations);
          }
        } catch (e) {
          console.warn("Failed to parse subtitleTranslations:", e);
        }
        const transformedBanner = {
          id: parseInt(String(banner.id)) || 0,
          isEnabled: banner.isActive,
          titleEn: banner.title,
          subtitleEn: banner.subtitle,
          titleTranslations,
          subtitleTranslations,
          targetPrice: String(banner.targetPrice || "1.00"),
          originalPrice: banner.originalPrice ? String(banner.originalPrice) : void 0,
          endDateTime: banner.endDate,
          // Frontend expects endDateTime
          backgroundColor: banner.backgroundColor,
          textColor: banner.textColor,
          priority: banner.priority
        };
        return new Response(JSON.stringify(transformedBanner), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
          }
        });
      } catch (error) {
        console.error("Error fetching active countdown banner:", error);
        return new Response(JSON.stringify({
          error: "Failed to fetch active countdown banner",
          details: error instanceof Error ? error.message : "Unknown error"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
          }
        });
      }
    }, "onRequestGet");
    onRequestOptions33 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
  }
});

// api/customer/login.ts
var onRequestPost16, onRequestOptions34;
var init_login2 = __esm({
  "api/customer/login.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    onRequestPost16 = /* @__PURE__ */ __name(async ({ request, env }) => {
      try {
        const { email, password, recaptchaToken } = await request.json();
        console.log("Login attempt for email:", email);
        if (email === "demo@example.com" && password === "demo123") {
          return new Response(JSON.stringify({
            success: true,
            user: {
              id: 1,
              email: "demo@example.com",
              name: "Demo User",
              role: "customer"
            },
            token: "demo-jwt-token"
          }), {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        if (!env.DB) {
          console.error("Database not available");
          return new Response(JSON.stringify({
            success: false,
            message: "Database not available"
          }), {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        let user = null;
        try {
          console.log("Querying users table for email:", email);
          const emailOnlyResult = await env.DB.prepare(`
        SELECT id, email, name, role, created_at, password
        FROM users WHERE email = ?
      `).bind(email).first();
          if (emailOnlyResult) {
            console.log("User found with email:", email);
            console.log("Stored password starts with:", emailOnlyResult.password?.substring(0, 10));
            console.log("Input password:", password);
            if (emailOnlyResult.password?.startsWith("$2b$")) {
              console.log("Password is hashed, implementing bcrypt comparison");
              try {
                const bcrypt = await Promise.resolve().then(() => (init_bcryptjs(), bcryptjs_exports));
                const isMatch = await bcrypt.compare(password, emailOnlyResult.password);
                if (isMatch) {
                  user = emailOnlyResult;
                  console.log("Bcrypt password match for user:", user.email);
                } else {
                  console.log("Bcrypt password mismatch");
                }
              } catch (bcryptError) {
                console.log("Bcrypt comparison failed:", bcryptError);
              }
            } else {
              if (emailOnlyResult.password === password) {
                user = emailOnlyResult;
                console.log("Plain text password match for user:", user.email);
              } else {
                console.log("Plain text password mismatch");
              }
            }
          } else {
            console.log("No user found with this email in users table");
          }
        } catch (e) {
          console.log("Users table query failed:", e);
        }
        if (user) {
          return new Response(JSON.stringify({
            success: true,
            user,
            token: `jwt-token-${user.id}-${Date.now()}`
          }), {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        console.log("User found:", user ? "Yes" : "No");
        console.log("Email check:", email);
        console.log("Password length:", password ? password.length : 0);
        return new Response(JSON.stringify({
          success: false,
          message: "Invalid credentials"
        }), {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          message: "Login failed"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestPost");
    onRequestOptions34 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
  }
});

// api/customer/profile.ts
var onRequestGet34, onRequestPut14, onRequestOptions35;
var init_profile = __esm({
  "api/customer/profile.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    init_user_storage();
    onRequestGet34 = /* @__PURE__ */ __name(async ({ request, env }) => {
      try {
        const url = new URL(request.url);
        const userId = url.searchParams.get("userId");
        if (!userId) {
          return new Response(JSON.stringify({
            success: false,
            message: "User ID is required"
          }), {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        const userStorage = new UserStorage(env.DB);
        await userStorage.initializeUsers();
        const user = await userStorage.getUserById(parseInt(userId));
        if (!user) {
          return new Response(JSON.stringify({
            success: false,
            message: "User not found"
          }), {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        const userQuery = `
      SELECT 
        id, email, name, role, created_at,
        is_premium, premium_activated_at, total_spent, 
        total_orders, extension_activated
      FROM users 
      WHERE id = ?
    `;
        const userResult = await env.DB.prepare(userQuery).bind(user.id).first();
        const profile = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isPremium: Boolean(userResult?.is_premium),
          premiumActivatedAt: userResult?.premium_activated_at,
          totalSpent: parseFloat(userResult?.total_spent || "0"),
          totalOrders: parseInt(userResult?.total_orders || "0"),
          extensionActivated: Boolean(userResult?.extension_activated),
          subscriptionStatus: userResult?.is_premium ? "premium" : "free",
          plan: userResult?.is_premium ? "premium" : "free",
          joinedDate: user.created_at?.split("T")[0] || "2024-01-15",
          lastLogin: (/* @__PURE__ */ new Date()).toISOString(),
          createdAt: user.created_at,
          settings: {
            notifications: true,
            emailUpdates: true,
            theme: "light"
          }
        };
        return new Response(JSON.stringify(profile), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Failed to get user profile:", error);
        return new Response(JSON.stringify({
          success: false,
          message: "Failed to load profile"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestGet");
    onRequestPut14 = /* @__PURE__ */ __name(async ({ request }) => {
      try {
        const updates = await request.json();
        return new Response(JSON.stringify({
          success: true,
          message: "Profile updated successfully",
          profile: {
            ...updates,
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          }
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          message: "Failed to update profile"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestPut");
    onRequestOptions35 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
  }
});

// api/customer/register.ts
var onRequestPost17, onRequestOptions36;
var init_register2 = __esm({
  "api/customer/register.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    onRequestPost17 = /* @__PURE__ */ __name(async ({ request, env }) => {
      try {
        const { email, password, name, recaptchaToken } = await request.json();
        if (!email || !password || !name) {
          return new Response(JSON.stringify({
            success: false,
            message: "Missing required fields"
          }), {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        if (!env.DB) {
          console.error("D1 database not available");
          return new Response(JSON.stringify({
            success: false,
            message: "Database not available"
          }), {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'customer',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
        await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_premium BOOLEAN DEFAULT 0,
        extension_activated BOOLEAN DEFAULT 0,
        total_spent DECIMAL(10,2) DEFAULT 0,
        total_orders INTEGER DEFAULT 0
      )
    `).run();
        const now = (/* @__PURE__ */ new Date()).toISOString();
        console.log("Registering user:", email, "with password length:", password.length);
        const existingUser = await env.DB.prepare(`
      SELECT id FROM users WHERE email = ?
    `).bind(email).first();
        if (existingUser) {
          return new Response(JSON.stringify({
            success: false,
            message: "User already exists"
          }), {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        const userResult = await env.DB.prepare(`
      INSERT INTO users (email, password, name, role, created_at)
      VALUES (?, ?, ?, 'customer', ?)
    `).bind(email, password, name, now).run();
        console.log("User inserted with ID:", userResult.meta.last_row_id);
        const customerResult = await env.DB.prepare(`
      INSERT INTO customers (email, name, created_at)
      VALUES (?, ?, ?)
    `).bind(email, name, now).run();
        console.log("Customer inserted with ID:", customerResult.meta.last_row_id);
        return new Response(JSON.stringify({
          success: true,
          message: "Registration successful",
          user: {
            id: userResult.meta.last_row_id,
            email,
            name,
            role: "customer"
          }
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Registration error:", error);
        return new Response(JSON.stringify({
          success: false,
          message: "Registration failed: " + error.message
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestPost");
    onRequestOptions36 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
  }
});

// api/customer/stats.ts
var onRequestGet35, onRequestOptions37;
var init_stats2 = __esm({
  "api/customer/stats.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    onRequestGet35 = /* @__PURE__ */ __name(async () => {
      const stats = {
        totalApplications: 47,
        successfulApplications: 12,
        pendingApplications: 8,
        rejectedApplications: 27,
        successRate: 25.5,
        averageResponseTime: "3.2 days",
        monthlyApplications: [
          { month: "Jan", applications: 15, success: 4 },
          { month: "Feb", applications: 12, success: 3 },
          { month: "Mar", applications: 20, success: 5 }
        ],
        recentActivity: [
          { date: "2024-03-15", action: "Applied to Software Engineer at TechCorp", status: "pending" },
          { date: "2024-03-14", action: "Interview scheduled with StartupXYZ", status: "success" },
          { date: "2024-03-13", action: "Application rejected by BigTech Inc", status: "rejected" }
        ]
      };
      return new Response(JSON.stringify(stats), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }, "onRequestGet");
    onRequestOptions37 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
  }
});

// api/download-extension/premium.ts
var onRequestGet36;
var init_premium = __esm({
  "api/download-extension/premium.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    onRequestGet36 = /* @__PURE__ */ __name(async ({ request, env }) => {
      try {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return new Response("Unauthorized", { status: 401 });
        }
        const token = authHeader.substring(7);
        if (token === "demo-jwt-token") {
          const mockZipContent = new Uint8Array([
            80,
            75,
            3,
            4,
            20,
            0,
            0,
            0,
            8,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            80,
            75,
            5,
            6,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ]);
          return new Response(mockZipContent, {
            headers: {
              "Content-Type": "application/zip",
              "Content-Disposition": 'attachment; filename="ocus-job-hunter-premium-v2.1.8-STABLE.zip"',
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        if (token.startsWith("jwt-token-")) {
          const userId = parseInt(token.split("-")[2], 10);
          if (isNaN(userId)) {
            return new Response("Invalid token format", { status: 401 });
          }
          if (!env.DB) {
            return new Response("Database not available", { status: 500 });
          }
          const customer = await env.DB.prepare(
            "SELECT extension_activated, total_spent FROM customers WHERE id = ?"
          ).bind(userId).first();
          if (!customer) {
            return new Response("Customer not found", { status: 404 });
          }
          const orderCheck = await env.DB.prepare(`
        SELECT COUNT(*) as orderCount, SUM(final_amount) as totalPaid
        FROM orders 
        WHERE user_id = ? AND status = 'completed' AND final_amount > 0
      `).bind(userId).first();
          const hasValidPurchase = customer.extension_activated && orderCheck && orderCheck.orderCount > 0 && parseFloat(orderCheck.totalPaid || "0") > 0;
          if (hasValidPurchase) {
            try {
              const downloadToken = `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              const now = (/* @__PURE__ */ new Date()).toISOString();
              await env.DB.prepare(`
            INSERT INTO extension_downloads (
              customer_id, download_token, download_type, downloaded_at, 
              ip_address, user_agent, created_at
            ) VALUES (?, ?, 'premium', ?, ?, ?, ?)
          `).bind(
                userId,
                downloadToken,
                now,
                request.headers.get("CF-Connecting-IP") || "unknown",
                request.headers.get("User-Agent") || "unknown",
                now
              ).run();
            } catch (e) {
              console.log("Failed to log download:", e);
            }
            const mockZipContent = new Uint8Array([
              80,
              75,
              3,
              4,
              20,
              0,
              0,
              0,
              8,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              80,
              75,
              5,
              6,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0
            ]);
            return new Response(mockZipContent, {
              headers: {
                "Content-Type": "application/zip",
                "Content-Disposition": 'attachment; filename="ocus-job-hunter-premium-v2.1.8-STABLE.zip"',
                "Access-Control-Allow-Origin": "*"
              }
            });
          }
        }
        return new Response("Premium access required", { status: 403 });
      } catch (error) {
        return new Response("Download failed", { status: 500 });
      }
    }, "onRequestGet");
  }
});

// api/download-extension/trial.ts
var onRequestGet37;
var init_trial = __esm({
  "api/download-extension/trial.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    onRequestGet37 = /* @__PURE__ */ __name(async ({ request, env }) => {
      try {
        const mockZipContent = new Uint8Array([
          80,
          75,
          3,
          4,
          // ZIP file signature
          20,
          0,
          0,
          0,
          8,
          0,
          // Version, flags, compression
          0,
          0,
          0,
          0,
          // Date/time
          0,
          0,
          0,
          0,
          // CRC-32
          0,
          0,
          0,
          0,
          // Compressed size
          0,
          0,
          0,
          0,
          // Uncompressed size
          0,
          0,
          // Filename length
          0,
          0,
          // Extra field length
          80,
          75,
          5,
          6,
          // End of central directory signature
          0,
          0,
          0,
          0,
          // Number of entries
          0,
          0,
          0,
          0,
          // Size of central directory
          0,
          0,
          0,
          0,
          // Offset of central directory
          0,
          0
          // Comment length
        ]);
        return new Response(mockZipContent, {
          headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": 'attachment; filename="ocus-job-hunter-trial-v2.1.8-STABLE.zip"',
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        return new Response("Download failed", { status: 500 });
      }
    }, "onRequestGet");
  }
});

// api/downloads/premium-extension.ts
var onRequestGet38, onRequestOptions38;
var init_premium_extension = __esm({
  "api/downloads/premium-extension.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    onRequestGet38 = /* @__PURE__ */ __name(async ({ request, env }) => {
      try {
        const url = new URL(request.url);
        const downloadToken = url.searchParams.get("token");
        if (!downloadToken) {
          return new Response(JSON.stringify({ error: "Download token is required" }), {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        const order = await env.DB.prepare(`
      SELECT * FROM orders 
      WHERE downloadToken = ? AND status = 'completed'
    `).bind(downloadToken).first();
        if (!order) {
          return new Response(JSON.stringify({ error: "Invalid or expired download token" }), {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        if (Number(order.downloadCount) >= Number(order.maxDownloads)) {
          return new Response(JSON.stringify({
            error: "Download limit exceeded",
            maxDownloads: order.maxDownloads,
            currentDownloads: order.downloadCount
          }), {
            status: 403,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        await env.DB.prepare(`
      UPDATE orders 
      SET downloadCount = downloadCount + 1 
      WHERE downloadToken = ?
    `).bind(downloadToken).run();
        console.log(`Premium extension downloaded for order ${order.id}, download count: ${Number(order.downloadCount) + 1}`);
        return new Response(JSON.stringify({
          success: true,
          message: "Premium extension download authorized",
          orderId: order.id,
          downloadCount: Number(order.downloadCount) + 1,
          maxDownloads: Number(order.maxDownloads),
          activationCode: order.activationCode
        }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Error processing download:", error);
        return new Response(JSON.stringify({
          success: false,
          error: "Failed to process download",
          details: String(error)
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestGet");
    onRequestOptions38 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
  }
});

// api/invoices/generate.ts
var onRequestGet39, onRequestOptions39;
var init_generate = __esm({
  "api/invoices/generate.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    onRequestGet39 = /* @__PURE__ */ __name(async ({ request, env }) => {
      try {
        const url = new URL(request.url);
        const orderId = url.searchParams.get("orderId");
        const invoiceNumber = url.searchParams.get("invoiceNumber");
        if (!orderId && !invoiceNumber) {
          return new Response(JSON.stringify({ error: "Order ID or Invoice Number is required" }), {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        let order = null;
        try {
          const orderQuery = orderId ? `SELECT * FROM orders WHERE id = ?` : `SELECT * FROM orders WHERE invoiceNumber = ?`;
          order = await env.DB.prepare(orderQuery).bind(orderId || invoiceNumber).first();
        } catch (dbError) {
          console.log("Orders table not found, checking fallback storage:", dbError);
          const settingsResults = await env.DB.prepare(`
        SELECT key, value FROM settings 
        WHERE key LIKE 'order_%'
      `).all();
          for (const setting of settingsResults.results || []) {
            try {
              const orderData = JSON.parse(setting.value);
              if (orderId && orderData.id == orderId || invoiceNumber && orderData.invoiceNumber === invoiceNumber) {
                order = orderData;
                break;
              }
            } catch (parseError) {
              console.log("Error parsing order data:", parseError);
            }
          }
        }
        if (!order) {
          return new Response(JSON.stringify({ error: "Order not found" }), {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        const invoiceData = {
          invoiceNumber: order.invoiceNumber || "",
          orderId: order.id,
          customerEmail: order.customerEmail,
          customerName: order.customerName,
          issueDate: order.completedAt || order.createdAt,
          dueDate: order.completedAt || order.createdAt,
          // Company details
          company: {
            name: "OCUS Job Hunter",
            address: "Digital Services Company",
            email: "support@jobhunter.one",
            website: "https://jobhunter.one"
          },
          // Customer details
          customer: {
            name: order.customerName,
            email: order.customerEmail
          },
          // Items
          items: [{
            description: order.productName,
            quantity: 1,
            unitPrice: order.finalAmount,
            total: order.finalAmount
          }],
          // Totals
          subtotal: order.finalAmount,
          tax: 0,
          total: order.finalAmount,
          currency: order.currency,
          // Payment details
          paymentMethod: order.paymentMethod,
          paymentStatus: order.status,
          activationCode: order.activationCode,
          downloadToken: order.downloadToken
        };
        return new Response(JSON.stringify({
          success: true,
          invoice: invoiceData
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Error generating invoice:", error);
        return new Response(JSON.stringify({
          success: false,
          error: "Failed to generate invoice",
          details: String(error)
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestGet");
    onRequestOptions39 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
  }
});

// api/me/invoices.ts
function json8(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
var onRequestGet40, onRequestOptions40;
var init_invoices3 = __esm({
  "api/me/invoices.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    __name(json8, "json");
    onRequestGet40 = /* @__PURE__ */ __name(async ({ request, env }) => {
      try {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return json8({ error: "Unauthorized" }, 401);
        }
        const token = authHeader.substring(7);
        if (token === "demo-jwt-token") {
          return json8([
            {
              id: 1,
              invoice_number: "INV-2024-001",
              order_id: 1,
              amount: "29.99",
              currency: "eur",
              tax_amount: "0.00",
              status: "paid",
              invoice_date: (/* @__PURE__ */ new Date()).toISOString(),
              paid_at: (/* @__PURE__ */ new Date()).toISOString(),
              created_at: (/* @__PURE__ */ new Date()).toISOString(),
              customer_name: "Demo User",
              customer_email: "demo@example.com",
              payment_method: "stripe",
              product_id: "premium-extension"
            }
          ]);
        }
        if (token.startsWith("jwt-token-")) {
          const parts = token.split("-");
          if (parts.length >= 3) {
            const userId = parts[2];
            if (!env.DB) {
              return json8({ error: "Database not available" }, 500);
            }
            try {
              const customer = await env.DB.prepare(`
            SELECT id, email, name
            FROM customers WHERE id = ?
          `).bind(parseInt(userId)).first();
              if (!customer) {
                return json8({ error: "Customer not found" }, 404);
              }
              const invoices = await env.DB.prepare(`
            SELECT 
              i.id,
              i.invoiceNumber as invoice_number,
              i.orderId as order_id,
              o.finalAmount as amount,
              i.currency,
              i.taxAmount as tax_amount,
              i.status,
              i.invoiceDate as invoice_date,
              i.dueDate as due_date,
              i.paidAt as paid_at,
              i.createdAt as created_at,
              o.customerName as customer_name,
              o.customerEmail as customer_email,
              o.paymentMethod as payment_method,
              'premium-extension' as product_id
            FROM invoices i
            LEFT JOIN orders o ON i.orderId = o.id
            WHERE i.customerId = ?
            ORDER BY i.createdAt DESC
          `).bind(parseInt(userId)).all();
              return json8(invoices.results || []);
            } catch (dbError) {
              console.error("Database error in /api/me/invoices:", dbError);
              return json8({ error: "Database error" }, 500);
            }
          }
        }
        return json8({ error: "Invalid token" }, 401);
      } catch (error) {
        return json8({
          error: error.message
        }, 500);
      }
    }, "onRequestGet");
    onRequestOptions40 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }, "onRequestOptions");
  }
});

// api/me/orders.ts
function json9(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
var onRequestGet41, onRequestOptions41;
var init_orders3 = __esm({
  "api/me/orders.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    __name(json9, "json");
    onRequestGet41 = /* @__PURE__ */ __name(async ({ request, env }) => {
      try {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return json9({ error: "Unauthorized" }, 401);
        }
        const token = authHeader.substring(7);
        if (token === "demo-jwt-token") {
          return json9([
            {
              id: 1,
              customerEmail: "demo@example.com",
              customerName: "Demo User",
              originalAmount: "29.99",
              finalAmount: "29.99",
              currency: "eur",
              status: "completed",
              paymentMethod: "stripe",
              downloadToken: "demo-download-token",
              downloadCount: 1,
              maxDownloads: 5,
              activationCode: "DEMO-ACTIVATION-CODE",
              createdAt: (/* @__PURE__ */ new Date()).toISOString(),
              completedAt: (/* @__PURE__ */ new Date()).toISOString()
            }
          ]);
        }
        if (token.startsWith("jwt-token-")) {
          const parts = token.split("-");
          if (parts.length >= 3) {
            const userId = parts[2];
            if (!env.DB) {
              return json9({ error: "Database not available" }, 500);
            }
            try {
              const customer = await env.DB.prepare(`
            SELECT id, email, name
            FROM customers WHERE id = ?
          `).bind(parseInt(userId)).first();
              if (!customer) {
                return json9({ error: "Customer not found" }, 404);
              }
              const orders = await env.DB.prepare(`
            SELECT 
              id,
              customerEmail,
              customerName,
              originalAmount,
              finalAmount,
              currency,
              status,
              paymentMethod,
              downloadToken,
              downloadCount,
              maxDownloads,
              activationCode,
              createdAt,
              completedAt
            FROM orders
            WHERE customerId = ?
            ORDER BY createdAt DESC
          `).bind(parseInt(userId)).all();
              return json9(orders.results || []);
            } catch (dbError) {
              console.error("Database error in /api/me/orders:", dbError);
              return json9({ error: "Database error" }, 500);
            }
          }
        }
        return json9({ error: "Invalid token" }, 401);
      } catch (error) {
        return json9({
          error: error.message
        }, 500);
      }
    }, "onRequestGet");
    onRequestOptions41 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }, "onRequestOptions");
  }
});

// api/orders/complete-purchase.ts
var onRequestPost18, onRequestOptions42;
var init_complete_purchase = __esm({
  "api/orders/complete-purchase.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    onRequestPost18 = /* @__PURE__ */ __name(async ({ request, env }) => {
      try {
        const body = await request.json();
        const { paymentIntentId, customerEmail, customerName, amount, currency } = body;
        if (!paymentIntentId || !customerEmail || !customerName || !amount) {
          return new Response(JSON.stringify({ error: "Missing required fields" }), {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        const downloadToken = crypto.randomUUID();
        const activationCode = Math.random().toString(36).substring(2, 15).toUpperCase();
        const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        let orderId = null;
        try {
          const orderResult = await env.DB.prepare(`
        INSERT INTO orders (
          customerEmail, customerName, productId, productName,
          originalAmount, finalAmount, currency, status, paymentMethod,
          paymentIntentId, downloadToken, activationCode, invoiceNumber,
          completedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).bind(
            customerEmail,
            customerName,
            1,
            // Product ID for OCUS Extension
            "OCUS Job Hunter Extension",
            amount,
            amount,
            currency.toUpperCase(),
            "completed",
            "stripe",
            paymentIntentId,
            downloadToken,
            activationCode,
            invoiceNumber
          ).run();
          orderId = orderResult.meta?.last_row_id;
        } catch (dbError) {
          console.log("Orders table not found, using fallback storage:", dbError);
          const orderData = {
            id: Date.now(),
            customerEmail,
            customerName,
            productId: 1,
            productName: "OCUS Job Hunter Extension",
            originalAmount: amount,
            finalAmount: amount,
            currency: currency.toUpperCase(),
            status: "completed",
            paymentMethod: "stripe",
            paymentIntentId,
            downloadToken,
            activationCode,
            invoiceNumber,
            completedAt: (/* @__PURE__ */ new Date()).toISOString()
          };
          const settingsKey = `order_${paymentIntentId}`;
          await env.DB.prepare(`
        INSERT OR REPLACE INTO settings (key, value, updated_at)
        VALUES (?, ?, datetime('now'))
      `).bind(settingsKey, JSON.stringify(orderData)).run();
          orderId = orderData.id;
        }
        try {
          await env.DB.prepare(`
        INSERT OR REPLACE INTO users (
          email, name, isPremium, lastLoginAt, updatedAt
        ) VALUES (?, ?, 1, datetime('now'), datetime('now'))
      `).bind(customerEmail, customerName).run();
        } catch (userDbError) {
          console.log("Users table not found, using fallback storage:", userDbError);
          const userData = {
            email: customerEmail,
            name: customerName,
            isPremium: true,
            lastLoginAt: (/* @__PURE__ */ new Date()).toISOString(),
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          };
          const userSettingsKey = `user_${customerEmail.replace("@", "_at_").replace(".", "_dot_")}`;
          await env.DB.prepare(`
        INSERT OR REPLACE INTO settings (key, value, updated_at)
        VALUES (?, ?, datetime('now'))
      `).bind(userSettingsKey, JSON.stringify(userData)).run();
        }
        return new Response(JSON.stringify({
          success: true,
          orderId,
          downloadToken,
          activationCode,
          invoiceNumber,
          message: "Purchase completed successfully"
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Error completing purchase:", error);
        return new Response(JSON.stringify({
          success: false,
          error: "Failed to complete purchase",
          details: String(error)
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestPost");
    onRequestOptions42 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
  }
});

// api/orders/user-orders.ts
var onRequestGet42, onRequestOptions43;
var init_user_orders = __esm({
  "api/orders/user-orders.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    onRequestGet42 = /* @__PURE__ */ __name(async ({ request, env }) => {
      try {
        const url = new URL(request.url);
        const customerEmail = url.searchParams.get("email");
        if (!customerEmail) {
          return new Response(JSON.stringify({ error: "Email parameter is required" }), {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        let orders = [];
        try {
          const orderResults = await env.DB.prepare(`
        SELECT * FROM orders 
        WHERE customerEmail = ? 
        ORDER BY createdAt DESC
      `).bind(customerEmail).all();
          orders = orderResults.results || [];
        } catch (dbError) {
          console.log("Orders table not found, checking fallback storage:", dbError);
          const settingsResults = await env.DB.prepare(`
        SELECT key, value FROM settings 
        WHERE key LIKE 'order_%'
      `).all();
          const allOrders = [];
          for (const setting of settingsResults.results || []) {
            try {
              const orderData = JSON.parse(setting.value);
              if (orderData.customerEmail === customerEmail) {
                allOrders.push(orderData);
              }
            } catch (parseError) {
              console.log("Error parsing order data:", parseError);
            }
          }
          orders = allOrders.sort((a, b) => {
            const dateA = new Date(a.completedAt || a.createdAt);
            const dateB = new Date(b.completedAt || b.createdAt);
            return dateB.getTime() - dateA.getTime();
          });
        }
        return new Response(JSON.stringify({
          success: true,
          orders
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Error fetching user orders:", error);
        return new Response(JSON.stringify({
          success: false,
          error: "Failed to fetch orders",
          details: String(error)
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestGet");
    onRequestOptions43 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
  }
});

// api/products/pricing.ts
async function onRequestGet43(context) {
  const { env } = context;
  try {
    const selectQuery = `SELECT * FROM products WHERE id = 1 AND isActive = 1`;
    const result = await env.DB.prepare(selectQuery).first();
    if (!result) {
      return new Response(JSON.stringify({
        id: 1,
        name: "OCUS Job Hunter Extension",
        price: "250.00",
        beforePrice: null
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }
    return new Response(JSON.stringify({
      id: result.id,
      name: result.name,
      price: result.price.toString(),
      beforePrice: result.beforePrice ? result.beforePrice.toString() : null
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  } catch (error) {
    console.error("Error fetching pricing:", error);
    return new Response(JSON.stringify({
      message: "Error fetching pricing: " + error.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }
}
async function onRequestOptions44(context) {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
var init_pricing2 = __esm({
  "api/products/pricing.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    __name(onRequestGet43, "onRequestGet");
    __name(onRequestOptions44, "onRequestOptions");
  }
});

// api/download-extension/[type].ts
var onRequestGet44, onRequestOptions45;
var init_type = __esm({
  "api/download-extension/[type].ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    onRequestGet44 = /* @__PURE__ */ __name(async (context) => {
      try {
        const { params, request } = context;
        const downloadType = params.type;
        const url = new URL(request.url);
        const userId = url.searchParams.get("userId") || "1";
        if (!["premium", "trial"].includes(downloadType)) {
          return new Response(JSON.stringify({ error: "Invalid download type" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }
        if (downloadType === "premium") {
          const userQuery = `SELECT is_premium FROM users WHERE id = ?`;
          const userResult = await context.env.DB.prepare(userQuery).bind(userId).first();
          if (!userResult?.is_premium) {
            return new Response(JSON.stringify({ error: "Premium access required" }), {
              status: 403,
              headers: { "Content-Type": "application/json" }
            });
          }
        }
        const downloadLogQuery = `
      INSERT INTO user_downloads (user_id, download_type, version, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?)
    `;
        const clientIP = request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || "unknown";
        const userAgent = request.headers.get("User-Agent") || "unknown";
        await context.env.DB.prepare(downloadLogQuery).bind(userId, downloadType, "v2.1.9", clientIP, userAgent).run();
        const fileName = downloadType === "premium" ? "ocus-job-hunter-premium-v2.1.9-STABLE.zip" : "ocus-job-hunter-trial-v2.1.9-STABLE.zip";
        const mockFileContent = `Mock ${downloadType} extension file content for ${fileName}`;
        return new Response(mockFileContent, {
          status: 200,
          headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="${fileName}"`,
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Error handling extension download:", error);
        return new Response(JSON.stringify({ error: "Download failed" }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestGet");
    onRequestOptions45 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
  }
});

// api/generate-invoice/[orderId].ts
async function onRequestPost19(context) {
  const { request, env, params } = context;
  const orderId = params.orderId;
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const orderQuery = `
      SELECT 
        id, customer_id, customer_email, customer_name, 
        product_id, final_amount, currency, payment_method,
        status, completed_at, created_at
      FROM orders 
      WHERE id = ? AND status = 'completed'
    `;
    const orderResult = await env.DB.prepare(orderQuery).bind(orderId).first();
    if (!orderResult) {
      return new Response(JSON.stringify({
        success: false,
        error: "Order not found or not completed"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
    const existingInvoiceQuery = `
      SELECT id FROM invoices WHERE order_id = ?
    `;
    const existingInvoice = await env.DB.prepare(existingInvoiceQuery).bind(orderId).first();
    if (existingInvoice) {
      return new Response(JSON.stringify({
        success: false,
        error: "Invoice already exists for this order"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
    const invoiceNumber = `INV-${Date.now()}-${orderId}`;
    const amount = parseFloat(orderResult.final_amount);
    const taxRate = 0;
    const taxAmount = amount * taxRate;
    const createInvoiceQuery = `
      INSERT INTO invoices (
        invoice_number, order_id, customer_id, amount, currency,
        tax_amount, status, invoice_date, paid_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const invoiceResult = await env.DB.prepare(createInvoiceQuery).bind(
      invoiceNumber,
      orderId,
      orderResult.customer_id,
      orderResult.final_amount,
      orderResult.currency,
      taxAmount.toString(),
      "paid",
      // Since order is completed, invoice is paid
      orderResult.completed_at || now,
      orderResult.completed_at || now,
      now
    ).run();
    if (!invoiceResult.success) {
      throw new Error("Failed to create invoice");
    }
    return new Response(JSON.stringify({
      success: true,
      invoiceId: invoiceResult.meta.last_row_id,
      invoiceNumber,
      message: "Invoice created successfully"
    }), {
      status: 201,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to create invoice"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
}
var init_orderId2 = __esm({
  "api/generate-invoice/[orderId].ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    __name(onRequestPost19, "onRequestPost");
  }
});

// api/tickets/[id].ts
function json10(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
var onRequestPatch2, onRequestPut15, onRequestDelete5, onRequestOptions46;
var init_id5 = __esm({
  "api/tickets/[id].ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    init_db();
    __name(json10, "json");
    onRequestPatch2 = /* @__PURE__ */ __name(async ({ request, params, env }) => {
      try {
        const ticketId = Number(params.id);
        const expressBase = env?.EXPRESS_API_BASE;
        if (expressBase) {
          const base = expressBase.replace(/\/$/, "");
          const url = `${base}/api/tickets/${ticketId}`;
          const headers = {};
          const cookie = request.headers.get("cookie");
          const ct = request.headers.get("content-type");
          const auth = request.headers.get("authorization");
          if (cookie) headers["cookie"] = cookie;
          if (ct) headers["content-type"] = ct;
          if (auth) headers["authorization"] = auth;
          const proxied = await fetch(url, { method: "PATCH", headers, body: request.body, redirect: "manual" });
          const respHeaders = new Headers(proxied.headers);
          const setCookie = respHeaders.get("set-cookie");
          if (setCookie) {
            const rewritten = setCookie.replace(/;\s*Domain=[^;]+/i, "");
            respHeaders.delete("set-cookie");
            respHeaders.append("set-cookie", rewritten);
          }
          return new Response(proxied.body, { status: proxied.status, headers: respHeaders });
        }
        const updates = await request.json();
        const storage = new TicketStorage(env.DB);
        const ticket = await storage.getTicketById(ticketId);
        if (!ticket) return json10({ success: false, message: "Ticket not found" }, 404);
        if (updates.status) {
          await storage.updateTicketStatus(ticketId, updates.status);
        }
        const updatedTicket = await storage.getTicketById(ticketId);
        return json10({ success: true, ticket: updatedTicket });
      } catch (error) {
        console.error("Failed to update ticket:", error);
        const message = error instanceof Error ? error.message : "An unknown error occurred";
        return json10({ success: false, message }, 500);
      }
    }, "onRequestPatch");
    onRequestPut15 = /* @__PURE__ */ __name(async (ctx) => {
      return onRequestPatch2(ctx);
    }, "onRequestPut");
    onRequestDelete5 = /* @__PURE__ */ __name(async ({ request, params, env }) => {
      try {
        const ticketId = Number(params.id);
        const expressBase = env?.EXPRESS_API_BASE;
        if (expressBase) {
          const base = expressBase.replace(/\/$/, "");
          const url = `${base}/api/tickets/${ticketId}`;
          const headers = {};
          const cookie = request.headers.get("cookie");
          const auth = request.headers.get("authorization");
          if (cookie) headers["cookie"] = cookie;
          if (auth) headers["authorization"] = auth;
          const proxied = await fetch(url, { method: "DELETE", headers, redirect: "manual" });
          const respHeaders = new Headers(proxied.headers);
          const setCookie = respHeaders.get("set-cookie");
          if (setCookie) {
            const rewritten = setCookie.replace(/;\s*Domain=[^;]+/i, "");
            respHeaders.delete("set-cookie");
            respHeaders.append("set-cookie", rewritten);
          }
          return new Response(proxied.body, { status: proxied.status, headers: respHeaders });
        }
        const storage = new TicketStorage(env.DB);
        const ticket = await storage.getTicketById(ticketId);
        if (!ticket) {
          return json10({ success: false, message: "Ticket not found" }, 404);
        }
        await storage.deleteTicket(ticketId);
        return json10({ success: true, message: `Ticket ${ticketId} deleted` });
      } catch (error) {
        console.error("Failed to delete ticket:", error);
        const message = error instanceof Error ? error.message : "An unknown error occurred";
        return json10({ success: false, message }, 500);
      }
    }, "onRequestDelete");
    onRequestOptions46 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "PUT, PATCH, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
  }
});

// api/auth-settings.ts
var defaultSettings, onRequestGet45, onRequestOptions47;
var init_auth_settings2 = __esm({
  "api/auth-settings.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    defaultSettings = {
      googleEnabled: false,
      facebookEnabled: false,
      githubEnabled: false,
      recaptchaEnabled: false,
      recaptchaCustomerEnabled: false,
      recaptchaAdminEnabled: false,
      recaptchaSiteKey: "",
      googleClientId: "",
      facebookAppId: "",
      githubClientId: ""
    };
    onRequestGet45 = /* @__PURE__ */ __name(async ({ env }) => {
      try {
        const dbQuery = "SELECT * FROM auth_settings WHERE id = 1";
        const dbSettings = await env.DB.prepare(dbQuery).first();
        const apiSettings = {
          ...defaultSettings,
          ...dbSettings && {
            googleEnabled: !!dbSettings.google_enabled,
            facebookEnabled: !!dbSettings.facebook_enabled,
            githubEnabled: !!dbSettings.github_enabled,
            recaptchaEnabled: !!dbSettings.recaptcha_enabled,
            recaptchaCustomerEnabled: !!dbSettings.recaptcha_customer_enabled,
            recaptchaAdminEnabled: !!dbSettings.recaptcha_admin_enabled,
            recaptchaSiteKey: dbSettings.recaptcha_site_key || "",
            googleClientId: dbSettings.google_client_id || "",
            facebookAppId: dbSettings.facebook_app_id || "",
            githubClientId: dbSettings.github_client_id || ""
          }
        };
        return new Response(JSON.stringify(apiSettings), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Failed to fetch auth settings:", error);
        return new Response(JSON.stringify(defaultSettings), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestGet");
    onRequestOptions47 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
  }
});

// api/chat.ts
var onRequestPost20, onRequestOptions48;
var init_chat = __esm({
  "api/chat.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    init_settings_storage();
    onRequestPost20 = /* @__PURE__ */ __name(async ({ request, env }) => {
      try {
        const { message, history } = await request.json();
        let openaiApiKey = null;
        if (env.DB) {
          try {
            const settingsStorage = new SettingsStorage(env.DB);
            await settingsStorage.initializeSettings();
            openaiApiKey = await settingsStorage.getOpenAIApiKey();
          } catch (error) {
            console.error("Failed to get API key from settings:", error);
          }
        }
        if (!openaiApiKey) {
          openaiApiKey = env.OPENAI_API_KEY;
        }
        if (!openaiApiKey) {
          return new Response(JSON.stringify({
            success: false,
            response: "I'm currently not configured to respond. Please contact our support team for assistance."
          }), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        const conversationHistory = history?.map((msg) => ({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.text
        })) || [];
        const systemPrompt = {
          role: "system",
          content: `You are a helpful AI assistant for the OCUS Job Hunter Chrome Extension. You help users with:
      
      - Understanding how to use the job hunting extension
      - Troubleshooting extension issues
      - Explaining features and benefits
      - Providing job search tips and strategies
      - Answering questions about pricing and subscriptions
      
      Keep responses helpful, concise, and focused on job hunting and the extension. If asked about unrelated topics, politely redirect to job hunting assistance.`
        };
        const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openaiApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              systemPrompt,
              ...conversationHistory,
              { role: "user", content: message }
            ],
            max_tokens: 500,
            temperature: 0.7
          })
        });
        if (!openaiResponse.ok) {
          throw new Error(`OpenAI API error: ${openaiResponse.status}`);
        }
        const openaiData = await openaiResponse.json();
        const assistantResponse = openaiData.choices[0]?.message?.content || "I'm having trouble processing your request. Please try again or contact our support team.";
        return new Response(JSON.stringify({
          success: true,
          response: assistantResponse
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Chat API error:", error);
        return new Response(JSON.stringify({
          success: false,
          response: "I'm experiencing technical difficulties. Please contact our support team for immediate assistance."
        }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestPost");
    onRequestOptions48 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }, "onRequestOptions");
  }
});

// api/complete-stripe-payment.ts
function json11(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
var onRequestPost21, onRequestOptions49;
var init_complete_stripe_payment = __esm({
  "api/complete-stripe-payment.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    __name(json11, "json");
    onRequestPost21 = /* @__PURE__ */ __name(async ({ request, env }) => {
      try {
        const body = await request.json();
        const { paymentIntentId, customerEmail, customerName } = body;
        if (!paymentIntentId || !customerEmail) {
          return json11({ success: false, message: "Missing required fields" }, 400);
        }
        console.log("Stripe payment completion request:", { paymentIntentId, customerEmail, customerName });
        const purchaseCompleteRequest = {
          paymentIntentId,
          customerEmail,
          customerName,
          amount: 29.99,
          // Default amount - should be passed from frontend
          currency: "USD",
          productType: "premium_extension"
        };
        if (!env.DB) {
          console.error("D1 database not available");
          return json11({ success: false, message: "Database not available" }, 500);
        }
        const now = (/* @__PURE__ */ new Date()).toISOString();
        try {
          const userUpdateResult = await env.DB.prepare(`
        UPDATE users 
        SET is_premium = 1,
            extension_activated = 1,
            premium_activated_at = ?
        WHERE email = ?
      `).bind(now, customerEmail).run();
          console.log("User table update result for", customerEmail, ":", userUpdateResult);
          let finalCustomerId = null;
          const existingCustomer = await env.DB.prepare(`
        SELECT id FROM customers WHERE email = ?
      `).bind(customerEmail).first();
          if (existingCustomer) {
            finalCustomerId = existingCustomer.id;
            await env.DB.prepare(`
          UPDATE customers 
          SET is_premium = 1,
              extension_activated = 1
          WHERE id = ?
        `).bind(finalCustomerId).run();
          } else {
            const result = await env.DB.prepare(`
          INSERT INTO customers (
            email, name, is_premium, extension_activated, 
            created_at
          ) VALUES (?, ?, 1, 1, ?)
        `).bind(
              customerEmail,
              customerName || customerEmail,
              now
            ).run();
            finalCustomerId = result.meta?.last_row_id;
          }
          console.log("Final customer ID for orders/invoices:", finalCustomerId);
          const downloadToken = `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const orderResult = await env.DB.prepare(`
        INSERT INTO orders (
          customer_id, customer_email, customer_name, 
          original_amount, final_amount, currency, status, payment_method,
          payment_intent_id, download_token, created_at, completed_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'completed', 'stripe', ?, ?, ?, ?)
      `).bind(
            finalCustomerId,
            customerEmail,
            customerName || customerEmail,
            purchaseCompleteRequest.amount,
            purchaseCompleteRequest.amount,
            purchaseCompleteRequest.currency.toLowerCase(),
            paymentIntentId,
            downloadToken,
            now,
            now
          ).run();
          const orderId = orderResult.meta?.last_row_id;
          const activationCode = `OCUS_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
          await env.DB.prepare(`
        INSERT INTO activation_codes (
          code, order_id, created_at
        ) VALUES (?, ?, ?)
      `).bind(activationCode, orderId, now).run();
          console.log("Skipping invoice creation due to schema conflicts");
          console.log("Purchase completed successfully:", {
            customerId: finalCustomerId,
            orderId,
            paymentIntentId,
            activationCode
          });
          return json11({
            success: true,
            activationKey: activationCode,
            message: "Payment completed successfully"
          });
        } catch (error) {
          console.error("Error in complete-stripe-payment:", error);
          return json11({
            success: false,
            message: error.message
          }, 500);
        }
      } catch (error) {
        console.error("Error in complete-stripe-payment:", error);
        return json11({
          success: false,
          message: error.message
        }, 500);
      }
    }, "onRequestPost");
    onRequestOptions49 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
  }
});

// api/create-user-payment-intent.ts
var onRequestPost22, onRequestOptions50;
var init_create_user_payment_intent = __esm({
  "api/create-user-payment-intent.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    onRequestPost22 = /* @__PURE__ */ __name(async ({ request, env }) => {
      try {
        const body = await request.json();
        const { amount, currency = "usd", customerEmail, customerName, productId } = body;
        console.log("Payment intent request:", { amount, currency, customerEmail, productId });
        const numericAmount = typeof amount === "string" ? parseFloat(amount) : Number(amount);
        if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0) {
          console.error("Invalid amount received:", { amount, numericAmount, type: typeof amount });
          return new Response(JSON.stringify({
            success: false,
            error: `Invalid amount: ${amount}. Must be a positive number.`
          }), {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        const paymentSettings = await env.DB.prepare(`
      SELECT key, value FROM settings 
      WHERE key LIKE 'payment_%'
    `).all();
        const settings = {};
        paymentSettings.results?.forEach((row) => {
          const key = row.key.replace("payment_", "");
          let value = row.value;
          if (value === "true") value = true;
          if (value === "false") value = false;
          settings[key] = value;
        });
        if (!settings.stripeEnabled || !settings.stripeSecretKey) {
          return new Response(JSON.stringify({
            success: false,
            error: "Payment processing not configured"
          }), {
            status: 503,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        const stripeResponse = await fetch("https://api.stripe.com/v1/payment_intents", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${settings.stripeSecretKey}`,
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            amount: Math.round(numericAmount * 100).toString(),
            // Convert to cents
            currency: currency.toLowerCase(),
            "automatic_payment_methods[enabled]": "true",
            ...customerEmail && { receipt_email: customerEmail },
            ...productId && { "metadata[productId]": productId, "metadata[customerName]": customerName || "" }
          })
        });
        if (!stripeResponse.ok) {
          const errorData = await stripeResponse.text();
          console.error("Stripe API error:", {
            status: stripeResponse.status,
            statusText: stripeResponse.statusText,
            errorData,
            requestData: {
              amount: Math.round(numericAmount * 100),
              currency: currency.toLowerCase(),
              hasSecretKey: !!settings.stripeSecretKey,
              secretKeyPrefix: settings.stripeSecretKey?.substring(0, 12) + "..."
            }
          });
          let stripeError;
          try {
            stripeError = JSON.parse(errorData);
          } catch {
            stripeError = { message: errorData };
          }
          return new Response(JSON.stringify({
            success: false,
            error: "Failed to create payment intent",
            details: stripeError.error?.message || stripeError.message || "Unknown Stripe error",
            stripeErrorType: stripeError.error?.type,
            stripeErrorCode: stripeError.error?.code
          }), {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        const paymentIntent = await stripeResponse.json();
        try {
          await env.DB.prepare(`
        INSERT INTO settings (key, value) 
        VALUES (?, ?)
      `).bind(
            `payment_intent_${paymentIntent.id}`,
            JSON.stringify({
              id: paymentIntent.id,
              amount: numericAmount,
              currency,
              customerEmail,
              customerName,
              productId,
              status: "created",
              createdAt: (/* @__PURE__ */ new Date()).toISOString()
            })
          ).run();
        } catch (dbError) {
          console.warn("Failed to store payment intent in database:", dbError);
        }
        return new Response(JSON.stringify({
          success: true,
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          publishableKey: settings.stripePublicKey
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Payment intent creation error:", error);
        return new Response(JSON.stringify({
          success: false,
          error: "Internal server error"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestPost");
    onRequestOptions50 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
  }
});

// api/download-premium.ts
function json12(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
var onRequestPost23, onRequestGet46, onRequestOptions51;
var init_download_premium = __esm({
  "api/download-premium.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    __name(json12, "json");
    onRequestPost23 = /* @__PURE__ */ __name(async ({ request, env }) => {
      try {
        const body = await request.json();
        const { customerId, customerEmail, activationCode, email } = body;
        const finalEmail = customerEmail || email;
        if (!customerId && !finalEmail && !activationCode) {
          return json12({
            success: false,
            message: "Customer identification required"
          }, 400);
        }
        if (!env.DB) {
          console.error("D1 database not available");
          return json12({ success: false, message: "Database not available" }, 500);
        }
        try {
          let account = null;
          let accountType = null;
          if (customerId) {
            try {
              account = await env.DB.prepare(`
            SELECT id, email, name, is_premium, extension_activated, total_spent 
            FROM customers WHERE id = ?
          `).bind(customerId).first();
              if (account) accountType = "customer";
            } catch (e) {
              console.log("Customer query failed, trying fallback");
            }
          } else if (finalEmail) {
            try {
              account = await env.DB.prepare(`
            SELECT id, email, name, is_premium, extension_activated, total_spent 
            FROM customers WHERE email = ?
          `).bind(finalEmail).first();
              if (account) accountType = "customer";
            } catch (e) {
              console.log("Customer email query failed, trying fallback");
            }
          } else if (activationCode) {
            try {
              const codeResult = await env.DB.prepare(`
            SELECT c.id, c.email, c.name, c.is_premium, c.extension_activated, c.total_spent
            FROM customers c
            JOIN activation_codes ac ON c.id = ac.customer_id
            WHERE ac.code = ? AND ac.is_active = 1
          `).bind(activationCode).first();
              account = codeResult;
              if (account) accountType = "customer";
            } catch (e) {
              console.log("Activation code query failed:", e);
            }
          }
          if (!account && finalEmail) {
            try {
              const user = await env.DB.prepare(`
            SELECT id, email, name, is_premium, extension_activated
            FROM users WHERE email = ?
          `).bind(finalEmail).first();
              if (user) {
                account = { ...user, total_spent: 0 };
                accountType = "user";
              }
            } catch (e) {
              console.log("User email query failed:", e);
            }
          }
          if (!account) {
            return json12({
              success: false,
              message: "Account not found or invalid credentials"
            }, 404);
          }
          const hasBasicAccess = account.is_premium && account.extension_activated;
          if (!hasBasicAccess) {
            return json12({
              success: false,
              message: "Premium access not activated. Please complete your purchase first.",
              accountStatus: {
                isPremium: account.is_premium,
                extensionActivated: account.extension_activated,
                totalSpent: account.total_spent
              }
            }, 403);
          }
          let hasValidOrders = false;
          if (account.is_premium) {
            hasValidOrders = true;
            console.log(`Premium account '${account.email}' granted access based on premium flag.`);
          } else {
            try {
              const orderCheck = await env.DB.prepare(`
            SELECT COUNT(*) as orderCount FROM orders 
            WHERE (customer_id = ? OR customer_email = ?) AND status = 'completed' AND final_amount > 0
          `).bind(account.id, account.email).first();
              hasValidOrders = orderCheck?.orderCount > 0;
              console.log(`Order check for ${accountType} '${account.email}':`, { hasValidOrders });
            } catch (e) {
              console.log("Order check failed:", e);
              hasValidOrders = account.is_premium && account.extension_activated;
            }
          }
          if (!hasValidOrders) {
            return json12({
              success: false,
              message: "No valid premium purchases found. Premium download requires completed payment.",
              accountStatus: {
                isPremium: account.is_premium,
                extensionActivated: account.extension_activated,
                totalSpent: account.total_spent,
                requiresPayment: true
              }
            }, 403);
          }
          const downloadToken = `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const now = (/* @__PURE__ */ new Date()).toISOString();
          try {
            await env.DB.prepare(`
          INSERT INTO extension_downloads (
            customer_id, download_token, downloaded_at, ip_address, user_agent, created_at
          ) VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
              account.id,
              // Use account.id, which exists for both users and customers
              downloadToken,
              now,
              request.headers.get("CF-Connecting-IP") || "unknown",
              request.headers.get("User-Agent") || "unknown",
              now
            ).run();
          } catch (e) {
            console.log("Failed to log download, continuing anyway:", e);
          }
          let activationCodeResult = `TEMP_${Date.now()}_${account.id}`;
          if (accountType === "customer") {
            try {
              const result = await env.DB.prepare(`SELECT code FROM activation_codes WHERE customer_id = ? AND is_active = 1 ORDER BY created_at DESC LIMIT 1`).bind(account.id).first();
              if (result) activationCodeResult = result.code;
            } catch (e) {
              console.log("Failed to get activation code:", e);
            }
          }
          return json12({
            success: true,
            message: "Download access granted",
            downloadEnabled: true,
            downloadToken,
            activationCode: activationCodeResult,
            account: {
              id: account.id,
              email: account.email,
              name: account.name
            }
          });
        } catch (dbError) {
          console.error("Database error during download validation:", dbError);
          return json12({
            success: false,
            message: "Failed to validate download access",
            error: dbError.message
          }, 500);
        }
      } catch (error) {
        console.error("Download validation error:", error);
        return json12({
          success: false,
          message: "Internal server error",
          error: error.message
        }, 500);
      }
    }, "onRequestPost");
    onRequestGet46 = /* @__PURE__ */ __name(async ({ request, env }) => {
      const url = new URL(request.url);
      const customerId = url.searchParams.get("customerId");
      const customerEmail = url.searchParams.get("customerEmail");
      if (!customerId && !customerEmail) {
        return json12({ success: false, message: "Customer identification required" }, 400);
      }
      if (!env.DB) {
        return json12({ success: false, message: "Database not available" }, 500);
      }
      try {
        let customer = null;
        if (customerId) {
          customer = await env.DB.prepare(`
        SELECT id, email, name, is_premium, extension_activated, total_spent 
        FROM customers WHERE id = ?
      `).bind(parseInt(customerId)).first();
        } else if (customerEmail) {
          customer = await env.DB.prepare(`
        SELECT id, email, name, is_premium, extension_activated, total_spent 
        FROM customers WHERE email = ?
      `).bind(customerEmail).first();
        }
        if (!customer) {
          return json12({ success: false, downloadEnabled: false, message: "Customer not found" });
        }
        const hasAccess = customer.is_premium && customer.extension_activated;
        return json12({
          success: true,
          downloadEnabled: hasAccess,
          customer: {
            id: customer.id,
            email: customer.email,
            name: customer.name,
            totalSpent: customer.total_spent,
            isPremium: customer.is_premium,
            extensionActivated: customer.extension_activated
          }
        });
      } catch (error) {
        console.error("Download status check error:", error);
        return json12({ success: false, downloadEnabled: false, error: error.message }, 500);
      }
    }, "onRequestGet");
    onRequestOptions51 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
  }
});

// api/init-db.ts
var onRequestGet47, onRequestOptions52;
var init_init_db = __esm({
  "api/init-db.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    onRequestGet47 = /* @__PURE__ */ __name(async ({ env }) => {
      try {
        if (!env.DB) {
          return new Response(JSON.stringify({
            success: false,
            message: "Database not available"
          }), {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'customer',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
        await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_premium BOOLEAN DEFAULT 0,
        extension_activated BOOLEAN DEFAULT 0,
        total_spent DECIMAL(10,2) DEFAULT 0,
        total_orders INTEGER DEFAULT 0
      )
    `).run();
        await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_number TEXT UNIQUE NOT NULL,
        customer_id INTEGER NOT NULL,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        invoice_date TEXT NOT NULL,
        due_date TEXT NOT NULL,
        subtotal TEXT NOT NULL,
        total_amount TEXT NOT NULL,
        currency TEXT DEFAULT 'USD',
        status TEXT DEFAULT 'pending',
        paid_at DATETIME,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
        await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status TEXT DEFAULT 'completed',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
        const now = (/* @__PURE__ */ new Date()).toISOString();
        await env.DB.prepare(`
      INSERT OR REPLACE INTO users (id, email, password, name, role, created_at)
      VALUES (1, 'demo@example.com', 'demo123', 'Demo User', 'customer', ?)
    `).bind(now).run();
        await env.DB.prepare(`
      INSERT OR REPLACE INTO customers (id, email, name, created_at, is_premium, extension_activated, total_spent, total_orders)
      VALUES (1, 'demo@example.com', 'Demo User', ?, 1, 1, 29.99, 1)
    `).bind(now).run();
        await env.DB.prepare(`
      INSERT OR REPLACE INTO invoices (id, invoice_number, customer_id, customer_name, customer_email, invoice_date, due_date, subtotal, total_amount, currency, status, paid_at, notes, created_at)
      VALUES (1, 'INV-2025-000001', 1, 'Demo User', 'demo@example.com', '2025-08-25', '2025-08-25', '29.99', '29.99', 'USD', 'paid', ?, 'Premium extension purchase', ?)
    `).bind(now, now).run();
        await env.DB.prepare(`
      INSERT OR REPLACE INTO orders (id, customer_id, product_name, amount, status, created_at)
      VALUES (1, 1, 'Premium Extension', 29.99, 'completed', ?)
    `).bind(now).run();
        const userCount = await env.DB.prepare("SELECT COUNT(*) as count FROM users").first();
        const customerCount = await env.DB.prepare("SELECT COUNT(*) as count FROM customers").first();
        const invoiceCount = await env.DB.prepare("SELECT COUNT(*) as count FROM invoices").first();
        const orderCount = await env.DB.prepare("SELECT COUNT(*) as count FROM orders").first();
        return new Response(JSON.stringify({
          success: true,
          message: "Database initialized successfully",
          tables: {
            users: userCount?.count || 0,
            customers: customerCount?.count || 0,
            invoices: invoiceCount?.count || 0,
            orders: orderCount?.count || 0
          }
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("Database initialization error:", error);
        return new Response(JSON.stringify({
          success: false,
          message: "Database initialization failed: " + error.message
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestGet");
    onRequestOptions52 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }, "onRequestOptions");
  }
});

// api/invoice-settings.ts
function getSettingsStore() {
  const g = globalThis;
  if (!g.__INVOICE_SETTINGS__) {
    g.__INVOICE_SETTINGS__ = {
      id: 1,
      companyName: "OCUS Job Hunter",
      companyAddress: "",
      companyPhone: "",
      companyEmail: "",
      companyWebsite: "",
      taxNumber: "",
      invoicePrefix: "INV",
      receiptPrefix: "REC",
      invoiceNotes: "",
      termsAndConditions: "",
      footerText: "Thank you for your business!",
      primaryColor: "#007bff",
      secondaryColor: "#6c757d",
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  return g.__INVOICE_SETTINGS__;
}
function json13(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
var onRequestGet48, onRequestPut16, onRequestOptions53;
var init_invoice_settings = __esm({
  "api/invoice-settings.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    __name(getSettingsStore, "getSettingsStore");
    __name(json13, "json");
    onRequestGet48 = /* @__PURE__ */ __name(async () => {
      const settings = getSettingsStore();
      const ui = {
        id: settings.id,
        companyName: settings.companyName,
        companyAddress: settings.companyAddress,
        companyPhone: settings.companyPhone,
        companyEmail: settings.companyEmail,
        companyWebsite: settings.companyWebsite,
        taxNumber: settings.taxNumber,
        invoicePrefix: settings.invoicePrefix,
        receiptPrefix: settings.receiptPrefix,
        invoiceNotes: settings.invoiceNotes,
        termsAndConditions: settings.termsAndConditions,
        footerText: settings.footerText,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor
      };
      return json13(ui);
    }, "onRequestGet");
    onRequestPut16 = /* @__PURE__ */ __name(async ({ request }) => {
      try {
        const body = await request.json().catch(() => ({}));
        const store = getSettingsStore();
        const allowedKeys = [
          "companyName",
          "companyAddress",
          "companyPhone",
          "companyEmail",
          "companyWebsite",
          "taxNumber",
          "invoicePrefix",
          "receiptPrefix",
          "invoiceNotes",
          "termsAndConditions",
          "footerText",
          "primaryColor",
          "secondaryColor"
        ];
        for (const k of allowedKeys) {
          if (k in body) store[k] = body[k];
        }
        store.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        return json13({ ...store });
      } catch (e) {
        return json13({ success: false, message: "Failed to update settings" }, 500);
      }
    }, "onRequestPut");
    onRequestOptions53 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
  }
});

// api/invoices.ts
function json14(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
var onRequestGet49;
var init_invoices4 = __esm({
  "api/invoices.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    __name(json14, "json");
    onRequestGet49 = /* @__PURE__ */ __name(async ({ request, env }) => {
      try {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return json14([]);
        }
        const token = authHeader.substring(7);
        if (token === "demo-jwt-token") {
          const demoInvoice = {
            id: 1,
            invoiceNumber: "INV-2025-000001",
            customerId: 1,
            customerName: "Demo User",
            customerEmail: "demo@example.com",
            invoiceDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
            dueDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
            subtotal: "29.99",
            totalAmount: "29.99",
            currency: "USD",
            status: "paid",
            paidAt: (/* @__PURE__ */ new Date()).toISOString(),
            notes: "Premium extension purchase"
          };
          return json14([demoInvoice]);
        }
        if (token.startsWith("jwt-token-")) {
          const parts = token.split("-");
          if (parts.length >= 3) {
            const userId = parts[2];
            if (userId === "1") {
              const demoInvoice = {
                id: 1,
                invoiceNumber: "INV-2025-000001",
                customerId: 1,
                customerName: "Demo User",
                customerEmail: "demo@example.com",
                invoiceDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
                dueDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
                subtotal: "29.99",
                totalAmount: "29.99",
                currency: "USD",
                status: "paid",
                paidAt: (/* @__PURE__ */ new Date()).toISOString(),
                notes: "Premium extension purchase"
              };
              return json14([demoInvoice]);
            }
          }
        }
        return json14([]);
      } catch (error) {
        return json14({
          error: error.message
        }, 500);
      }
    }, "onRequestGet");
  }
});

// api/me.ts
function json15(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
var onRequestGet50;
var init_me = __esm({
  "api/me.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    __name(json15, "json");
    onRequestGet50 = /* @__PURE__ */ __name(async ({ request, env }) => {
      try {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return json15({
            error: "Unauthorized"
          }, 401);
        }
        const token = authHeader.substring(7);
        if (token === "demo-jwt-token") {
          return json15({
            id: 1,
            email: "demo@example.com",
            name: "Demo User",
            role: "customer",
            createdAt: (/* @__PURE__ */ new Date()).toISOString(),
            isPremium: true,
            extensionActivated: true,
            totalSpent: 29.99,
            totalOrders: 1,
            isAuthenticated: true
          });
        }
        if (token.startsWith("jwt-token-")) {
          const parts = token.split("-");
          if (parts.length >= 3) {
            const userId = parts[2];
            console.log("Parsed userId from token:", userId, "from token:", token);
            if (!env.DB) {
              return json15({ error: "Database not available" }, 500);
            }
            try {
              const user = await env.DB.prepare(`
            SELECT id, email, name, role, created_at, is_premium, extension_activated
            FROM users WHERE id = ?
          `).bind(parseInt(userId)).first();
              if (user) {
                return json15({
                  id: user.id,
                  email: user.email,
                  name: user.name,
                  role: user.role || "customer",
                  createdAt: user.created_at,
                  isPremium: user.is_premium || false,
                  extensionActivated: user.extension_activated || false,
                  isAuthenticated: true
                });
              }
              const customer = await env.DB.prepare(`
            SELECT id, email, name, is_premium, extension_activated, created_at
            FROM customers WHERE id = ?
          `).bind(parseInt(userId)).first();
              if (customer) {
                return json15({
                  id: customer.id,
                  email: customer.email,
                  name: customer.name,
                  role: "customer",
                  createdAt: customer.created_at,
                  isPremium: customer.is_premium || false,
                  extensionActivated: customer.extension_activated || false,
                  isAuthenticated: true
                });
              }
            } catch (dbError) {
              console.error("Database error in /api/me:", dbError);
            }
          }
        }
        return json15({
          error: "Invalid token"
        }, 401);
      } catch (error) {
        return json15({
          error: error.message
        }, 500);
      }
    }, "onRequestGet");
  }
});

// api/migrate-db.ts
function json16(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
var onRequestGet51, onRequestOptions54;
var init_migrate_db = __esm({
  "api/migrate-db.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    __name(json16, "json");
    onRequestGet51 = /* @__PURE__ */ __name(async ({ env }) => {
      if (!env.DB) {
        return json16({ success: false, message: "Database not available" }, 500);
      }
      try {
        const alterStmt = `ALTER TABLE tickets ADD COLUMN customer_id INTEGER;`;
        await env.DB.prepare(alterStmt).run();
        const backfillStmt = `
      UPDATE tickets
      SET customer_id = (SELECT id FROM customers WHERE email = tickets.customer_email)
      WHERE customer_id IS NULL;
    `;
        const backfillResult = await env.DB.prepare(backfillStmt).run();
        return json16({
          success: true,
          message: "Database migration successful: customer_id added and backfilled.",
          backfillDetails: backfillResult.meta
        });
      } catch (e) {
        if (e.message.includes("duplicate column name")) {
          return json16({
            success: true,
            message: "Migration not needed: customer_id column already exists."
          });
        }
        console.error("Migration failed:", e);
        return json16({ success: false, message: e.message }, 500);
      }
    }, "onRequestGet");
    onRequestOptions54 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }, "onRequestOptions");
  }
});

// api/purchase-complete.ts
function json17(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
var onRequestPost24, onRequestOptions55;
var init_purchase_complete = __esm({
  "api/purchase-complete.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    __name(json17, "json");
    onRequestPost24 = /* @__PURE__ */ __name(async ({ request, env }) => {
      try {
        const body = await request.json();
        const {
          paymentIntentId,
          customerEmail,
          customerName,
          customerId,
          amount,
          currency = "USD",
          productType = "premium_extension"
        } = body;
        if (!paymentIntentId || !customerEmail || !amount) {
          return json17({ success: false, message: "Missing required fields" }, 400);
        }
        if (!env.DB) {
          console.error("D1 database not available");
          return json17({ success: false, message: "Database not available" }, 500);
        }
        const now = (/* @__PURE__ */ new Date()).toISOString();
        try {
          let finalCustomerId = customerId;
          if (customerEmail) {
            const userUpdateResult = await env.DB.prepare(`
          UPDATE users 
          SET is_premium = 1,
              extension_activated = 1,
              premium_activated_at = ?
          WHERE email = ?
        `).bind(now, customerEmail).run();
            console.log("User table update result for", customerEmail, ":", userUpdateResult);
            if (userUpdateResult.meta?.changes === 0) {
              console.log("No user found with email", customerEmail, "in users table");
            }
          }
          if (customerId) {
            await env.DB.prepare(`
          UPDATE customers 
          SET is_premium = 1,
              extension_activated = 1,
              updated_at = ?
          WHERE id = ?
        `).bind(now, customerId).run();
          } else {
            const existingCustomer = await env.DB.prepare(`
          SELECT id FROM customers WHERE email = ?
        `).bind(customerEmail).first();
            if (existingCustomer) {
              finalCustomerId = existingCustomer.id;
              await env.DB.prepare(`
            UPDATE customers 
            SET is_premium = 1,
                extension_activated = 1,
                updated_at = ?
            WHERE id = ?
          `).bind(now, finalCustomerId).run();
            } else {
              const result = await env.DB.prepare(`
            INSERT INTO customers (
              email, name, is_premium, extension_activated, 
              created_at, updated_at
            ) VALUES (?, ?, 1, 1, ?, ?)
          `).bind(
                customerEmail,
                customerName || customerEmail,
                now,
                now
              ).run();
              finalCustomerId = result.meta?.last_row_id;
            }
          }
          if (!finalCustomerId) {
            const existingCustomer = await env.DB.prepare(`
          SELECT id FROM customers WHERE email = ?
        `).bind(customerEmail).first();
            if (existingCustomer) {
              finalCustomerId = existingCustomer.id;
              await env.DB.prepare(`
            UPDATE customers 
            SET is_premium = 1,
                extension_activated = 1,
                updated_at = ?
            WHERE id = ?
          `).bind(now, finalCustomerId).run();
            } else {
              const result = await env.DB.prepare(`
            INSERT INTO customers (
              email, name, is_premium, extension_activated, 
              created_at, updated_at
            ) VALUES (?, ?, 1, 1, ?, ?)
          `).bind(
                customerEmail,
                customerName || customerEmail,
                now,
                now
              ).run();
              finalCustomerId = result.meta?.last_row_id;
            }
          }
          console.log("Final customer ID for orders/invoices:", finalCustomerId);
          const downloadToken = `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const orderResult = await env.DB.prepare(`
        INSERT INTO orders (
          customer_id, customer_email, customer_name, 
          original_amount, final_amount, currency, status, payment_method,
          payment_intent_id, download_token, created_at, completed_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'completed', 'stripe', ?, ?, ?, ?)
      `).bind(
            finalCustomerId,
            customerEmail,
            customerName || customerEmail,
            amount,
            amount,
            currency.toLowerCase(),
            paymentIntentId,
            downloadToken,
            now,
            now
          ).run();
          const orderId = orderResult.meta?.last_row_id;
          const activationCode = `OCUS_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
          await env.DB.prepare(`
        INSERT INTO activation_codes (
          code, order_id, created_at
        ) VALUES (?, ?, ?)
      `).bind(activationCode, orderId, now).run();
          console.log("Skipping invoice creation due to schema conflicts");
          console.log("Purchase completed successfully:", {
            customerId: finalCustomerId,
            orderId,
            paymentIntentId,
            amount,
            activationCode
          });
          return json17({
            success: true,
            message: "Purchase completed successfully",
            data: {
              customerId: finalCustomerId,
              orderId,
              activationCode,
              downloadEnabled: true
            }
          });
        } catch (dbError) {
          console.error("Database error during purchase completion:", dbError);
          return json17({
            success: false,
            message: "Failed to process purchase completion",
            error: dbError.message
          }, 500);
        }
      } catch (error) {
        console.error("Purchase completion error:", error);
        return json17({
          success: false,
          message: "Internal server error",
          error: error.message
        }, 500);
      }
    }, "onRequestPost");
    onRequestOptions55 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
  }
});

// api/test-upload.ts
var onRequestPost25, onRequestOptions56;
var init_test_upload = __esm({
  "api/test-upload.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    init_settings_storage();
    onRequestPost25 = /* @__PURE__ */ __name(async ({ request, env }) => {
      try {
        console.log("=== TEST UPLOAD ENDPOINT ===");
        if (!env.DB) {
          return new Response(JSON.stringify({
            success: false,
            message: "Database not available"
          }), {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        const formData = await request.formData();
        console.log("Test upload - FormData keys:", Array.from(formData.keys()));
        const testFile = formData.get("testImage");
        console.log("Test file received:", testFile ? `${testFile.name} (${testFile.size} bytes, ${testFile.type})` : "null");
        if (testFile && testFile.size > 0) {
          console.log("Converting test file to base64...");
          const arrayBuffer = await testFile.arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          const dataUrl = `data:${testFile.type};base64,${base64}`;
          console.log("Test file converted, data URL length:", dataUrl.length);
          const settingsStorage = new SettingsStorage(env.DB);
          await settingsStorage.initializeSettings();
          console.log("Saving test image to database...");
          await settingsStorage.setSetting("test_image", dataUrl);
          console.log("Test image saved successfully");
          console.log("Verifying saved data...");
          const savedData = await settingsStorage.getSetting("test_image");
          console.log("Retrieved data length:", savedData ? savedData.length : "null");
          return new Response(JSON.stringify({
            success: true,
            message: "Test upload successful",
            originalSize: testFile.size,
            dataUrlLength: dataUrl.length,
            savedDataLength: savedData ? savedData.length : 0,
            verified: savedData === dataUrl
          }), {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        } else {
          return new Response(JSON.stringify({
            success: false,
            message: "No file received or file is empty"
          }), {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
      } catch (error) {
        console.error("Test upload error:", error);
        const message = error instanceof Error ? error.message : String(error);
        return new Response(JSON.stringify({
          success: false,
          message: `Test upload failed: ${message}`
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }, "onRequestPost");
    onRequestOptions56 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }, "onRequestOptions");
  }
});

// api/test-user.ts
function json18(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
var onRequestPost26;
var init_test_user = __esm({
  "api/test-user.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    __name(json18, "json");
    onRequestPost26 = /* @__PURE__ */ __name(async ({ request, env }) => {
      try {
        const body = await request.json();
        const email = body.email || "heshmat@gmail.com";
        if (!env.DB) {
          return json18({ success: false, message: "Database not available" }, 500);
        }
        const user = await env.DB.prepare(`
      SELECT id, email, name, is_premium, extension_activated, premium_activated_at, created_at
      FROM users WHERE email = ?
    `).bind(email).first();
        const customer = await env.DB.prepare(`
      SELECT id, email, name, is_premium, extension_activated, created_at
      FROM customers WHERE email = ?
    `).bind(email).first();
        const ordersUserQuery = await env.DB.prepare(`
      SELECT id, customer_id, customer_email, original_amount, final_amount, status, created_at, completed_at
      FROM orders WHERE customer_email = ?
    `).bind(email).all();
        const ordersCustomerQuery = customer ? await env.DB.prepare(`
      SELECT id, customer_id, customer_email, original_amount, final_amount, status, created_at, completed_at
      FROM orders WHERE customer_id = ?
    `).bind(customer.id).all() : { results: [] };
        return json18({
          success: true,
          email,
          user,
          customer,
          ordersFromEmail: ordersUserQuery.results,
          ordersFromCustomerId: ordersCustomerQuery.results,
          summary: {
            userExists: !!user,
            customerExists: !!customer,
            userPremium: user?.is_premium === 1,
            customerPremium: customer?.is_premium === 1,
            userExtensionActivated: user?.extension_activated === 1,
            customerExtensionActivated: customer?.extension_activated === 1,
            totalOrdersFromEmail: ordersUserQuery.results?.length || 0,
            totalOrdersFromCustomerId: ordersCustomerQuery.results?.length || 0
          }
        });
      } catch (error) {
        console.error("Error checking user data:", error);
        return json18({
          success: false,
          message: error.message
        }, 500);
      }
    }, "onRequestPost");
  }
});

// api/tickets/index.ts
function json19(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
var onRequestOptions57, onRequestGet52, onRequestPost27;
var init_tickets2 = __esm({
  "api/tickets/index.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    init_db();
    init_user_storage();
    __name(json19, "json");
    onRequestOptions57 = /* @__PURE__ */ __name(async () => {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }, "onRequestOptions");
    onRequestGet52 = /* @__PURE__ */ __name(async ({ request, env }) => {
      const expressBase = env?.EXPRESS_API_BASE;
      if (expressBase) {
        const base = expressBase.replace(/\/$/, "");
        const urlObj = new URL(request.url);
        const qs = urlObj.search ? urlObj.search : "";
        const url2 = `${base}/api/tickets${qs}`;
        const headers = {};
        const cookie = request.headers.get("cookie");
        const auth = request.headers.get("authorization");
        if (cookie) headers["cookie"] = cookie;
        if (auth) headers["authorization"] = auth;
        const proxied = await fetch(url2, { headers, redirect: "manual" });
        const respHeaders = new Headers(proxied.headers);
        const setCookie = respHeaders.get("set-cookie");
        if (setCookie) {
          const rewritten = setCookie.replace(/;\s*Domain=[^;]+/i, "");
          respHeaders.delete("set-cookie");
          respHeaders.append("set-cookie", rewritten);
        }
        return new Response(proxied.body, { status: proxied.status, headers: respHeaders });
      }
      const url = new URL(request.url);
      const isAdmin = url.searchParams.get("isAdmin") === "true";
      const customerEmail = url.searchParams.get("customerEmail");
      const customerId = url.searchParams.get("customerId");
      if (!env.DB) {
        console.error("D1 database not available");
        return json19({ error: "Database not available" }, 500);
      }
      try {
        const storage = new TicketStorage(env.DB);
        let result = [];
        if (isAdmin) {
          result = await storage.getAllTickets();
        } else if (customerId) {
          result = await storage.getTicketsByCustomerId(parseInt(customerId));
        } else if (customerEmail) {
          result = await storage.getTicketsByCustomerEmail(customerEmail);
        } else {
          result = [];
        }
        return json19(result);
      } catch (error) {
        console.error("Database error:", error);
        return json19({ error: "Database query failed", details: error.message }, 500);
      }
    }, "onRequestGet");
    onRequestPost27 = /* @__PURE__ */ __name(async ({ request, env }) => {
      try {
        const expressBase = env?.EXPRESS_API_BASE;
        if (expressBase) {
          const base = expressBase.replace(/\/$/, "");
          const url = `${base}/api/tickets`;
          const headers = {};
          const cookie = request.headers.get("cookie");
          const ct = request.headers.get("content-type");
          const auth = request.headers.get("authorization");
          if (cookie) headers["cookie"] = cookie;
          if (ct) headers["content-type"] = ct;
          if (auth) headers["authorization"] = auth;
          const proxied = await fetch(url, { method: "POST", headers, body: request.body, redirect: "manual" });
          const respHeaders = new Headers(proxied.headers);
          const setCookie = respHeaders.get("set-cookie");
          if (setCookie) {
            const rewritten = setCookie.replace(/;\s*Domain=[^;]+/i, "");
            respHeaders.delete("set-cookie");
            respHeaders.append("set-cookie", rewritten);
          }
          return new Response(proxied.body, { status: proxied.status, headers: respHeaders });
        }
        const body = await request.json();
        const { title, description, category, priority, customerEmail, customerName, customerId } = body;
        const parsedCustomerId = customerId ? parseInt(customerId) : void 0;
        if (!title || !description || !customerEmail || !parsedCustomerId) {
          return json19({ success: false, message: "Missing required fields" }, 400);
        }
        if (!env.DB) {
          console.error("D1 database not available for ticket creation");
          return json19({ success: false, message: "Database not available" }, 500);
        }
        const storage = new TicketStorage(env.DB);
        let finalCustomerName = customerName;
        if (parsedCustomerId && !customerName) {
          try {
            const userStorage = new UserStorage(env.DB);
            await userStorage.initializeUsers();
            const user = await userStorage.getUserById(parsedCustomerId);
            if (user) {
              finalCustomerName = user.name;
            }
          } catch (error) {
            console.error("Failed to fetch user name:", error);
          }
        }
        const ticket = await storage.createTicket({
          customer_id: parsedCustomerId,
          title,
          description,
          category: category || "general",
          priority: priority || "medium",
          status: "open",
          customer_email: customerEmail,
          customer_name: finalCustomerName || customerEmail
        });
        return json19({ success: true, ticket });
      } catch (e) {
        console.error("Failed to create ticket:", e);
        const message = e instanceof Error ? e.message : "An unknown error occurred";
        return json19({ success: false, message }, 500);
      }
    }, "onRequestPost");
  }
});

// health.ts
var onRequestGet53;
var init_health = __esm({
  "health.ts"() {
    "use strict";
    init_functionsRoutes_0_0036357540446472214();
    onRequestGet53 = /* @__PURE__ */ __name(async () => {
      return new Response(JSON.stringify({
        status: "ok",
        timestamp: Date.now(),
        message: "OCUS Job Hunter API is running"
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }, "onRequestGet");
  }
});

// ../.wrangler/tmp/pages-S8PDOo/functionsRoutes-0.0036357540446472214.mjs
var routes;
var init_functionsRoutes_0_0036357540446472214 = __esm({
  "../.wrangler/tmp/pages-S8PDOo/functionsRoutes-0.0036357540446472214.mjs"() {
    "use strict";
    init_translate();
    init_translate();
    init_id();
    init_id();
    init_id();
    init_id();
    init_id2();
    init_id2();
    init_id2();
    init_id2();
    init_feature();
    init_feature();
    init_orderId();
    init_id3();
    init_id4();
    init_pdf();
    init_pdf();
    init_archive();
    init_messages();
    init_messages();
    init_messages();
    init_status();
    init_status();
    init_purchase_status();
    init_invoices();
    init_invoices();
    init_orders();
    init_orders();
    init_purchase_status2();
    init_purchase_status2();
    init_analytics();
    init_analytics();
    init_announcement_badges();
    init_announcement_badges();
    init_announcement_badges();
    init_announcement_badges();
    init_announcement_badges();
    init_auth_settings();
    init_auth_settings();
    init_auth_settings();
    init_chat_settings();
    init_chat_settings();
    init_chat_settings();
    init_check_user_data();
    init_countdown_banners();
    init_countdown_banners();
    init_countdown_banners();
    init_countdown_banners();
    init_countdown_banners();
    init_create_default_banner();
    init_create_default_banner();
    init_customers();
    init_customers();
    init_dashboard_features();
    init_dashboard_features();
    init_dashboard_features();
    init_fix_banner_price();
    init_fix_premium_users();
    init_fix_purchased_users();
    init_force_update_price();
    init_invoices2();
    init_invoices2();
    init_login();
    init_login();
    init_orders2();
    init_orders2();
    init_payment_settings();
    init_payment_settings();
    init_payment_settings();
    init_pricing();
    init_pricing();
    init_pricing();
    init_reset_db();
    init_reset_db();
    init_seo_settings();
    init_seo_settings();
    init_seo_settings();
    init_seo_settings();
    init_stats();
    init_stats();
    init_sync_banner_price();
    init_sync_banner_price();
    init_tickets();
    init_tickets();
    init_update_banner_price();
    init_update_banner_price();
    init_update_banner_price_direct();
    init_update_user_premium();
    init_users();
    init_users();
    init_active();
    init_active();
    init_facebook();
    init_github();
    init_google();
    init_register();
    init_register();
    init_active2();
    init_active2();
    init_login2();
    init_login2();
    init_profile();
    init_profile();
    init_profile();
    init_register2();
    init_register2();
    init_stats2();
    init_stats2();
    init_premium();
    init_trial();
    init_premium_extension();
    init_premium_extension();
    init_generate();
    init_generate();
    init_invoices3();
    init_invoices3();
    init_orders3();
    init_orders3();
    init_complete_purchase();
    init_complete_purchase();
    init_user_orders();
    init_user_orders();
    init_pricing2();
    init_pricing2();
    init_type();
    init_type();
    init_orderId2();
    init_id5();
    init_id5();
    init_id5();
    init_id5();
    init_auth_settings2();
    init_auth_settings2();
    init_chat();
    init_chat();
    init_complete_stripe_payment();
    init_complete_stripe_payment();
    init_create_user_payment_intent();
    init_create_user_payment_intent();
    init_download_premium();
    init_download_premium();
    init_download_premium();
    init_init_db();
    init_init_db();
    init_invoice_settings();
    init_invoice_settings();
    init_invoice_settings();
    init_invoices4();
    init_me();
    init_migrate_db();
    init_migrate_db();
    init_purchase_complete();
    init_purchase_complete();
    init_test_upload();
    init_test_upload();
    init_test_user();
    init_tickets2();
    init_tickets2();
    init_tickets2();
    init_health();
    routes = [
      {
        routePath: "/api/admin/announcement-badges/translate",
        mountPath: "/api/admin/announcement-badges",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions]
      },
      {
        routePath: "/api/admin/announcement-badges/translate",
        mountPath: "/api/admin/announcement-badges",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost]
      },
      {
        routePath: "/api/admin/announcement-badges/:id",
        mountPath: "/api/admin/announcement-badges",
        method: "DELETE",
        middlewares: [],
        modules: [onRequestDelete]
      },
      {
        routePath: "/api/admin/announcement-badges/:id",
        mountPath: "/api/admin/announcement-badges",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet]
      },
      {
        routePath: "/api/admin/announcement-badges/:id",
        mountPath: "/api/admin/announcement-badges",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions2]
      },
      {
        routePath: "/api/admin/announcement-badges/:id",
        mountPath: "/api/admin/announcement-badges",
        method: "PUT",
        middlewares: [],
        modules: [onRequestPut]
      },
      {
        routePath: "/api/admin/countdown-banners/:id",
        mountPath: "/api/admin/countdown-banners",
        method: "DELETE",
        middlewares: [],
        modules: [onRequestDelete2]
      },
      {
        routePath: "/api/admin/countdown-banners/:id",
        mountPath: "/api/admin/countdown-banners",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet2]
      },
      {
        routePath: "/api/admin/countdown-banners/:id",
        mountPath: "/api/admin/countdown-banners",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions3]
      },
      {
        routePath: "/api/admin/countdown-banners/:id",
        mountPath: "/api/admin/countdown-banners",
        method: "PUT",
        middlewares: [],
        modules: [onRequestPut2]
      },
      {
        routePath: "/api/admin/dashboard-features/:feature",
        mountPath: "/api/admin/dashboard-features",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions4]
      },
      {
        routePath: "/api/admin/dashboard-features/:feature",
        mountPath: "/api/admin/dashboard-features",
        method: "PUT",
        middlewares: [],
        modules: [onRequestPut3]
      },
      {
        routePath: "/api/admin/orders/:orderId",
        mountPath: "/api/admin/orders",
        method: "PUT",
        middlewares: [],
        modules: [onRequestPut4]
      },
      {
        routePath: "/api/extension/check/:id",
        mountPath: "/api/extension/check",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet3]
      },
      {
        routePath: "/api/extension/downloads/:id",
        mountPath: "/api/extension/downloads",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet4]
      },
      {
        routePath: "/api/invoices/:id/pdf",
        mountPath: "/api/invoices/:id",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet5]
      },
      {
        routePath: "/api/invoices/:id/pdf",
        mountPath: "/api/invoices/:id",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions5]
      },
      {
        routePath: "/api/tickets/:id/archive",
        mountPath: "/api/tickets/:id",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost2]
      },
      {
        routePath: "/api/tickets/:id/messages",
        mountPath: "/api/tickets/:id",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet6]
      },
      {
        routePath: "/api/tickets/:id/messages",
        mountPath: "/api/tickets/:id",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions6]
      },
      {
        routePath: "/api/tickets/:id/messages",
        mountPath: "/api/tickets/:id",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost3]
      },
      {
        routePath: "/api/tickets/:id/status",
        mountPath: "/api/tickets/:id",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions7]
      },
      {
        routePath: "/api/tickets/:id/status",
        mountPath: "/api/tickets/:id",
        method: "PUT",
        middlewares: [],
        modules: [onRequestPut5]
      },
      {
        routePath: "/api/user/:id/purchase-status",
        mountPath: "/api/user/:id",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet7]
      },
      {
        routePath: "/api/user/:userId/invoices",
        mountPath: "/api/user/:userId",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet8]
      },
      {
        routePath: "/api/user/:userId/invoices",
        mountPath: "/api/user/:userId",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions8]
      },
      {
        routePath: "/api/user/:userId/orders",
        mountPath: "/api/user/:userId",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet9]
      },
      {
        routePath: "/api/user/:userId/orders",
        mountPath: "/api/user/:userId",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions9]
      },
      {
        routePath: "/api/user/:userId/purchase-status",
        mountPath: "/api/user/:userId",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet10]
      },
      {
        routePath: "/api/user/:userId/purchase-status",
        mountPath: "/api/user/:userId",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions10]
      },
      {
        routePath: "/api/admin/analytics",
        mountPath: "/api/admin",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet11]
      },
      {
        routePath: "/api/admin/analytics",
        mountPath: "/api/admin",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions11]
      },
      {
        routePath: "/api/admin/announcement-badges",
        mountPath: "/api/admin",
        method: "DELETE",
        middlewares: [],
        modules: [onRequestDelete3]
      },
      {
        routePath: "/api/admin/announcement-badges",
        mountPath: "/api/admin",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet12]
      },
      {
        routePath: "/api/admin/announcement-badges",
        mountPath: "/api/admin",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions12]
      },
      {
        routePath: "/api/admin/announcement-badges",
        mountPath: "/api/admin",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost4]
      },
      {
        routePath: "/api/admin/announcement-badges",
        mountPath: "/api/admin",
        method: "PUT",
        middlewares: [],
        modules: [onRequestPut6]
      },
      {
        routePath: "/api/admin/auth-settings",
        mountPath: "/api/admin",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet13]
      },
      {
        routePath: "/api/admin/auth-settings",
        mountPath: "/api/admin",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions13]
      },
      {
        routePath: "/api/admin/auth-settings",
        mountPath: "/api/admin",
        method: "PUT",
        middlewares: [],
        modules: [onRequestPut7]
      },
      {
        routePath: "/api/admin/chat-settings",
        mountPath: "/api/admin",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet14]
      },
      {
        routePath: "/api/admin/chat-settings",
        mountPath: "/api/admin",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions14]
      },
      {
        routePath: "/api/admin/chat-settings",
        mountPath: "/api/admin",
        method: "PUT",
        middlewares: [],
        modules: [onRequestPut8]
      },
      {
        routePath: "/api/admin/check-user-data",
        mountPath: "/api/admin",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet15]
      },
      {
        routePath: "/api/admin/countdown-banners",
        mountPath: "/api/admin",
        method: "DELETE",
        middlewares: [],
        modules: [onRequestDelete4]
      },
      {
        routePath: "/api/admin/countdown-banners",
        mountPath: "/api/admin",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet16]
      },
      {
        routePath: "/api/admin/countdown-banners",
        mountPath: "/api/admin",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions15]
      },
      {
        routePath: "/api/admin/countdown-banners",
        mountPath: "/api/admin",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost5]
      },
      {
        routePath: "/api/admin/countdown-banners",
        mountPath: "/api/admin",
        method: "PUT",
        middlewares: [],
        modules: [onRequestPut9]
      },
      {
        routePath: "/api/admin/create-default-banner",
        mountPath: "/api/admin",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions16]
      },
      {
        routePath: "/api/admin/create-default-banner",
        mountPath: "/api/admin",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost6]
      },
      {
        routePath: "/api/admin/customers",
        mountPath: "/api/admin",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet17]
      },
      {
        routePath: "/api/admin/customers",
        mountPath: "/api/admin",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions17]
      },
      {
        routePath: "/api/admin/dashboard-features",
        mountPath: "/api/admin",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet18]
      },
      {
        routePath: "/api/admin/dashboard-features",
        mountPath: "/api/admin",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions18]
      },
      {
        routePath: "/api/admin/dashboard-features",
        mountPath: "/api/admin",
        method: "PUT",
        middlewares: [],
        modules: [onRequestPut10]
      },
      {
        routePath: "/api/admin/fix-banner-price",
        mountPath: "/api/admin",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost7]
      },
      {
        routePath: "/api/admin/fix-premium-users",
        mountPath: "/api/admin",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost8]
      },
      {
        routePath: "/api/admin/fix-purchased-users",
        mountPath: "/api/admin",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost9]
      },
      {
        routePath: "/api/admin/force-update-price",
        mountPath: "/api/admin",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet19]
      },
      {
        routePath: "/api/admin/invoices",
        mountPath: "/api/admin",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet20]
      },
      {
        routePath: "/api/admin/invoices",
        mountPath: "/api/admin",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions19]
      },
      {
        routePath: "/api/admin/login",
        mountPath: "/api/admin",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions20]
      },
      {
        routePath: "/api/admin/login",
        mountPath: "/api/admin",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost10]
      },
      {
        routePath: "/api/admin/orders",
        mountPath: "/api/admin",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet21]
      },
      {
        routePath: "/api/admin/orders",
        mountPath: "/api/admin",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions21]
      },
      {
        routePath: "/api/admin/payment-settings",
        mountPath: "/api/admin",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet22]
      },
      {
        routePath: "/api/admin/payment-settings",
        mountPath: "/api/admin",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions22]
      },
      {
        routePath: "/api/admin/payment-settings",
        mountPath: "/api/admin",
        method: "PUT",
        middlewares: [],
        modules: [onRequestPut11]
      },
      {
        routePath: "/api/admin/pricing",
        mountPath: "/api/admin",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet23]
      },
      {
        routePath: "/api/admin/pricing",
        mountPath: "/api/admin",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions23]
      },
      {
        routePath: "/api/admin/pricing",
        mountPath: "/api/admin",
        method: "PUT",
        middlewares: [],
        modules: [onRequestPut12]
      },
      {
        routePath: "/api/admin/reset-db",
        mountPath: "/api/admin",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions24]
      },
      {
        routePath: "/api/admin/reset-db",
        mountPath: "/api/admin",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost11]
      },
      {
        routePath: "/api/admin/seo-settings",
        mountPath: "/api/admin",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet24]
      },
      {
        routePath: "/api/admin/seo-settings",
        mountPath: "/api/admin",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions25]
      },
      {
        routePath: "/api/admin/seo-settings",
        mountPath: "/api/admin",
        method: "PATCH",
        middlewares: [],
        modules: [onRequestPatch]
      },
      {
        routePath: "/api/admin/seo-settings",
        mountPath: "/api/admin",
        method: "PUT",
        middlewares: [],
        modules: [onRequestPut13]
      },
      {
        routePath: "/api/admin/stats",
        mountPath: "/api/admin",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet25]
      },
      {
        routePath: "/api/admin/stats",
        mountPath: "/api/admin",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions26]
      },
      {
        routePath: "/api/admin/sync-banner-price",
        mountPath: "/api/admin",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions27]
      },
      {
        routePath: "/api/admin/sync-banner-price",
        mountPath: "/api/admin",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost12]
      },
      {
        routePath: "/api/admin/tickets",
        mountPath: "/api/admin",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet26]
      },
      {
        routePath: "/api/admin/tickets",
        mountPath: "/api/admin",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions28]
      },
      {
        routePath: "/api/admin/update-banner-price",
        mountPath: "/api/admin",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions29]
      },
      {
        routePath: "/api/admin/update-banner-price",
        mountPath: "/api/admin",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost13]
      },
      {
        routePath: "/api/admin/update-banner-price-direct",
        mountPath: "/api/admin",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet27]
      },
      {
        routePath: "/api/admin/update-user-premium",
        mountPath: "/api/admin",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost14]
      },
      {
        routePath: "/api/admin/users",
        mountPath: "/api/admin",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet28]
      },
      {
        routePath: "/api/admin/users",
        mountPath: "/api/admin",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions30]
      },
      {
        routePath: "/api/announcement-badge/active",
        mountPath: "/api/announcement-badge",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet29]
      },
      {
        routePath: "/api/announcement-badge/active",
        mountPath: "/api/announcement-badge",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions31]
      },
      {
        routePath: "/api/auth/facebook",
        mountPath: "/api/auth",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet30]
      },
      {
        routePath: "/api/auth/github",
        mountPath: "/api/auth",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet31]
      },
      {
        routePath: "/api/auth/google",
        mountPath: "/api/auth",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet32]
      },
      {
        routePath: "/api/auth/register",
        mountPath: "/api/auth",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions32]
      },
      {
        routePath: "/api/auth/register",
        mountPath: "/api/auth",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost15]
      },
      {
        routePath: "/api/countdown-banner/active",
        mountPath: "/api/countdown-banner",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet33]
      },
      {
        routePath: "/api/countdown-banner/active",
        mountPath: "/api/countdown-banner",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions33]
      },
      {
        routePath: "/api/customer/login",
        mountPath: "/api/customer",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions34]
      },
      {
        routePath: "/api/customer/login",
        mountPath: "/api/customer",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost16]
      },
      {
        routePath: "/api/customer/profile",
        mountPath: "/api/customer",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet34]
      },
      {
        routePath: "/api/customer/profile",
        mountPath: "/api/customer",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions35]
      },
      {
        routePath: "/api/customer/profile",
        mountPath: "/api/customer",
        method: "PUT",
        middlewares: [],
        modules: [onRequestPut14]
      },
      {
        routePath: "/api/customer/register",
        mountPath: "/api/customer",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions36]
      },
      {
        routePath: "/api/customer/register",
        mountPath: "/api/customer",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost17]
      },
      {
        routePath: "/api/customer/stats",
        mountPath: "/api/customer",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet35]
      },
      {
        routePath: "/api/customer/stats",
        mountPath: "/api/customer",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions37]
      },
      {
        routePath: "/api/download-extension/premium",
        mountPath: "/api/download-extension",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet36]
      },
      {
        routePath: "/api/download-extension/trial",
        mountPath: "/api/download-extension",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet37]
      },
      {
        routePath: "/api/downloads/premium-extension",
        mountPath: "/api/downloads",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet38]
      },
      {
        routePath: "/api/downloads/premium-extension",
        mountPath: "/api/downloads",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions38]
      },
      {
        routePath: "/api/invoices/generate",
        mountPath: "/api/invoices",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet39]
      },
      {
        routePath: "/api/invoices/generate",
        mountPath: "/api/invoices",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions39]
      },
      {
        routePath: "/api/me/invoices",
        mountPath: "/api/me",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet40]
      },
      {
        routePath: "/api/me/invoices",
        mountPath: "/api/me",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions40]
      },
      {
        routePath: "/api/me/orders",
        mountPath: "/api/me",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet41]
      },
      {
        routePath: "/api/me/orders",
        mountPath: "/api/me",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions41]
      },
      {
        routePath: "/api/orders/complete-purchase",
        mountPath: "/api/orders",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions42]
      },
      {
        routePath: "/api/orders/complete-purchase",
        mountPath: "/api/orders",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost18]
      },
      {
        routePath: "/api/orders/user-orders",
        mountPath: "/api/orders",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet42]
      },
      {
        routePath: "/api/orders/user-orders",
        mountPath: "/api/orders",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions43]
      },
      {
        routePath: "/api/products/pricing",
        mountPath: "/api/products",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet43]
      },
      {
        routePath: "/api/products/pricing",
        mountPath: "/api/products",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions44]
      },
      {
        routePath: "/api/download-extension/:type",
        mountPath: "/api/download-extension",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet44]
      },
      {
        routePath: "/api/download-extension/:type",
        mountPath: "/api/download-extension",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions45]
      },
      {
        routePath: "/api/generate-invoice/:orderId",
        mountPath: "/api/generate-invoice",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost19]
      },
      {
        routePath: "/api/tickets/:id",
        mountPath: "/api/tickets",
        method: "DELETE",
        middlewares: [],
        modules: [onRequestDelete5]
      },
      {
        routePath: "/api/tickets/:id",
        mountPath: "/api/tickets",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions46]
      },
      {
        routePath: "/api/tickets/:id",
        mountPath: "/api/tickets",
        method: "PATCH",
        middlewares: [],
        modules: [onRequestPatch2]
      },
      {
        routePath: "/api/tickets/:id",
        mountPath: "/api/tickets",
        method: "PUT",
        middlewares: [],
        modules: [onRequestPut15]
      },
      {
        routePath: "/api/auth-settings",
        mountPath: "/api",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet45]
      },
      {
        routePath: "/api/auth-settings",
        mountPath: "/api",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions47]
      },
      {
        routePath: "/api/chat",
        mountPath: "/api",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions48]
      },
      {
        routePath: "/api/chat",
        mountPath: "/api",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost20]
      },
      {
        routePath: "/api/complete-stripe-payment",
        mountPath: "/api",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions49]
      },
      {
        routePath: "/api/complete-stripe-payment",
        mountPath: "/api",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost21]
      },
      {
        routePath: "/api/create-user-payment-intent",
        mountPath: "/api",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions50]
      },
      {
        routePath: "/api/create-user-payment-intent",
        mountPath: "/api",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost22]
      },
      {
        routePath: "/api/download-premium",
        mountPath: "/api",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet46]
      },
      {
        routePath: "/api/download-premium",
        mountPath: "/api",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions51]
      },
      {
        routePath: "/api/download-premium",
        mountPath: "/api",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost23]
      },
      {
        routePath: "/api/init-db",
        mountPath: "/api",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet47]
      },
      {
        routePath: "/api/init-db",
        mountPath: "/api",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions52]
      },
      {
        routePath: "/api/invoice-settings",
        mountPath: "/api",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet48]
      },
      {
        routePath: "/api/invoice-settings",
        mountPath: "/api",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions53]
      },
      {
        routePath: "/api/invoice-settings",
        mountPath: "/api",
        method: "PUT",
        middlewares: [],
        modules: [onRequestPut16]
      },
      {
        routePath: "/api/invoices",
        mountPath: "/api",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet49]
      },
      {
        routePath: "/api/me",
        mountPath: "/api",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet50]
      },
      {
        routePath: "/api/migrate-db",
        mountPath: "/api",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet51]
      },
      {
        routePath: "/api/migrate-db",
        mountPath: "/api",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions54]
      },
      {
        routePath: "/api/purchase-complete",
        mountPath: "/api",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions55]
      },
      {
        routePath: "/api/purchase-complete",
        mountPath: "/api",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost24]
      },
      {
        routePath: "/api/test-upload",
        mountPath: "/api",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions56]
      },
      {
        routePath: "/api/test-upload",
        mountPath: "/api",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost25]
      },
      {
        routePath: "/api/test-user",
        mountPath: "/api",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost26]
      },
      {
        routePath: "/api/tickets",
        mountPath: "/api/tickets",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet52]
      },
      {
        routePath: "/api/tickets",
        mountPath: "/api/tickets",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions57]
      },
      {
        routePath: "/api/tickets",
        mountPath: "/api/tickets",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost27]
      },
      {
        routePath: "/health",
        mountPath: "/",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet53]
      }
    ];
  }
});

// ../.wrangler/tmp/bundle-i8frjF/middleware-loader.entry.ts
init_functionsRoutes_0_0036357540446472214();

// ../.wrangler/tmp/bundle-i8frjF/middleware-insertion-facade.js
init_functionsRoutes_0_0036357540446472214();

// ../../../.nvm/versions/node/v20.19.4/lib/node_modules/wrangler/templates/pages-template-worker.ts
init_functionsRoutes_0_0036357540446472214();

// ../../../.nvm/versions/node/v20.19.4/lib/node_modules/wrangler/node_modules/path-to-regexp/dist.es2015/index.js
init_functionsRoutes_0_0036357540446472214();
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../../../.nvm/versions/node/v20.19.4/lib/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");

// ../../../.nvm/versions/node/v20.19.4/lib/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
init_functionsRoutes_0_0036357540446472214();
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../.nvm/versions/node/v20.19.4/lib/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
init_functionsRoutes_0_0036357540446472214();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// ../.wrangler/tmp/bundle-i8frjF/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;

// ../../../.nvm/versions/node/v20.19.4/lib/node_modules/wrangler/templates/middleware/common.ts
init_functionsRoutes_0_0036357540446472214();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// ../.wrangler/tmp/bundle-i8frjF/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=functionsWorker-0.7669247166909905.mjs.map
