import { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import mobileAds, { AdsConsent, BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// Replace with the banner ad unit IDs from your AdMob account before publishing.
// Debug builds always use Google's test IDs: clicking real ads during development can get the account banned.
const PRODUCTION_UNIT_IDS = {
  ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  android: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
};

const unitId = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : Platform.OS === 'ios'
    ? PRODUCTION_UNIT_IDS.ios
    : PRODUCTION_UNIT_IDS.android;

let initPromise: Promise<boolean> | null = null;

/** Asks for GDPR consent (Google UMP) once, then initializes the ads SDK. Resolves to whether ads may be requested. */
function initAds(): Promise<boolean> {
  initPromise ??= (async () => {
    try {
      const { canRequestAds } = await AdsConsent.gatherConsent();
      if (!canRequestAds) return false;
      await mobileAds().initialize();
      return true;
    } catch {
      return false;
    }
  })();
  return initPromise;
}

export default function AdBanner() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    initAds().then((ok) => active && setReady(ok));
    return () => {
      active = false;
    };
  }, []);

  if (!ready) return null;
  return (
    <View style={{ alignItems: 'center' }}>
      <BannerAd unitId={unitId} size={BannerAdSize.LARGE_ANCHORED_ADAPTIVE_BANNER} />
    </View>
  );
}

/** Opens the consent form again so users can change their choice (required by GDPR). */
export async function openPrivacyOptions(): Promise<void> {
  try {
    await AdsConsent.showPrivacyOptionsForm();
  } catch {
    // Not available (e.g. user outside the EEA): nothing to show.
  }
}
