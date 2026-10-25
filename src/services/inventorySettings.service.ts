import { defaultAxios } from "@/utils/axios/default.axios";
import { API_ROUTES } from "@/utils/axios/apiEndPoint";

export interface InventorySettings {
  /** Warn about expiry this many days ahead (1-365) */
  expiry_warning_days: number;
  /** Extra addresses for low-stock emails (up to 10) */
  low_stock_alert_emails: string[];
}

export const inventorySettingsService = {
  getSettings: async (): Promise<InventorySettings> => {
    const res: { settings: InventorySettings } = await defaultAxios.get(
      API_ROUTES.INVENTORY.SETTINGS_INVENTORY
    );
    return res.settings;
  },

  updateSettings: async (
    data: Partial<InventorySettings>
  ): Promise<InventorySettings> => {
    const res: { settings: InventorySettings } = await defaultAxios.put(
      API_ROUTES.INVENTORY.SETTINGS_INVENTORY,
      data
    );
    return res.settings;
  },
};
