import React, { useEffect } from "react";
import { useMediaQuery } from "../useMediaQuery";

export function useAds() {
  useEffect(() => {
    const s = document.createElement("script");
    s.id = "useAds";
    s.async = true;
    s.src =
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2931647003376542";
    s.crossOrigin = "anonymous";

    try {
      document.querySelector("head")!.appendChild(s);
    } catch (e) {
      console.error(e);
    }
  }, []);
}

function useNotifyAdSense(enabled = true) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    try {
      // @ts-ignore
      (window.adsbygoogle! = window.adsbygoogle! || []).push({});
    } catch (e) {
      console.error(e);
    }
  }, [enabled]);
}

export const HorizontalAd = () => {
  useNotifyAdSense();

  return (
    <div className="HorizontalAd bg-body-secondary">
      <p className="text-center">
        <small>
          <i>Advertisement</i>
        </small>
      </p>

      {/* Hori-display */}
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-2931647003376542"
        data-ad-slot="5123646853"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export const BottomCenterAd = () => {
  useNotifyAdSense();

  return (
    <div className="BottomCenterAd bg-body-secondary">
      <p className="text-center">
        <small>
          <i>Advertisement</i>
        </small>
      </p>

      {/* Hori-display */}
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-2931647003376542"
        data-ad-slot="5123646853"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export const BottomRightAd = () => {
  const spaceAvailable = useMediaQuery("(min-width: 600px)");

  useNotifyAdSense(spaceAvailable);

  if (!spaceAvailable) {
    return null;
  }

  return (
    <div className="BottomRightAd bg-body-secondary">
      {/* Vert-display */}
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-2931647003376542"
        data-ad-slot="9062891869"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};
