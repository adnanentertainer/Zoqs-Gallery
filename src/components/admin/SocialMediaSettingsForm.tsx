"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthMessage } from "@/components/auth";
import {
  saveSocialMediaSettingsAction,
  testFacebookConnectionAction,
  testInstagramConnectionAction,
  syncProductFeedAction,
} from "@/app/admin/social-media/actions";
import type { SocialMediaSettings } from "@/types/socialMedia";

export function SocialMediaSettingsForm({
  initialValues,
}: {
  initialValues: SocialMediaSettings;
}) {
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fbTestMessage, setFbTestMessage] = useState<
    { variant: "error" | "success"; text: string } | null
  >(null);
  const [fbTesting, setFbTesting] = useState(false);
  const [igTestMessage, setIgTestMessage] = useState<
    { variant: "error" | "success"; text: string } | null
  >(null);
  const [igTesting, setIgTesting] = useState(false);
  const [feedSyncMessage, setFeedSyncMessage] = useState<
    { variant: "error" | "success"; text: string } | null
  >(null);
  const [feedSyncing, setFeedSyncing] = useState(false);

  const feedUrl = `${
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  }/product-feed.xml`;

  function update<K extends keyof SocialMediaSettings>(
    key: K,
    value: SocialMediaSettings[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const result = await saveSocialMediaSettingsAction(values);

    setIsSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    // The real token is never sent back down -- clear the field and keep
    // the "already have one" flag so the placeholder still shows correctly.
    setValues((prev) => ({
      ...prev,
      facebookAccessToken: "",
      hasFacebookAccessToken: prev.hasFacebookAccessToken || !!prev.facebookAccessToken,
    }));
    setSuccess(true);
  }

  async function handleTestFacebook() {
    setFbTesting(true);
    setFbTestMessage(null);
    const result = await testFacebookConnectionAction();
    setFbTesting(false);
    setFbTestMessage(
      result.error
        ? { variant: "error", text: result.error }
        : { variant: "success", text: result.success ?? "Connected." },
    );
  }

  async function handleTestInstagram() {
    setIgTesting(true);
    setIgTestMessage(null);
    const result = await testInstagramConnectionAction();
    setIgTesting(false);
    setIgTestMessage(
      result.error
        ? { variant: "error", text: result.error }
        : { variant: "success", text: result.success ?? "Connected." },
    );
  }

  async function handleSyncFeed() {
    setFeedSyncing(true);
    setFeedSyncMessage(null);
    const result = await syncProductFeedAction();
    setFeedSyncing(false);
    setFeedSyncMessage(
      result.error
        ? { variant: "error", text: result.error }
        : { variant: "success", text: result.success ?? "Synced." },
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex max-w-2xl flex-col gap-6 rounded-sm border border-beige bg-white p-6"
    >
      {error && <AuthMessage variant="error" message={error} />}
      {success && <AuthMessage variant="success" message="Settings saved." />}

      <label className="flex items-center gap-2 font-body text-sm text-primary">
        <input
          type="checkbox"
          checked={values.autoPostEnabled}
          onChange={(event) => update("autoPostEnabled", event.target.checked)}
          className="h-4 w-4 accent-gold"
        />
        Automatically post new/activated products
      </label>

      <div className="flex flex-col gap-3 border-t border-beige pt-4">
        <label className="flex items-center gap-2 font-body text-sm font-medium text-primary">
          <input
            type="checkbox"
            checked={values.facebookEnabled}
            onChange={(event) => update("facebookEnabled", event.target.checked)}
            className="h-4 w-4 accent-gold"
          />
          Post to Facebook Page
        </label>
        <Input
          label="Facebook Page ID"
          value={values.facebookPageId}
          onChange={(event) => update("facebookPageId", event.target.value)}
        />
        <Input
          label="Facebook Access Token"
          type="password"
          value={values.facebookAccessToken}
          placeholder={values.hasFacebookAccessToken ? "••••••••••••" : ""}
          onChange={(event) => update("facebookAccessToken", event.target.value)}
        />
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            isLoading={fbTesting}
            onClick={handleTestFacebook}
          >
            Test Connection
          </Button>
        </div>
        {fbTestMessage && (
          <AuthMessage variant={fbTestMessage.variant} message={fbTestMessage.text} />
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-beige pt-4">
        <label className="flex items-center gap-2 font-body text-sm font-medium text-primary">
          <input
            type="checkbox"
            checked={values.instagramEnabled}
            onChange={(event) => update("instagramEnabled", event.target.checked)}
            className="h-4 w-4 accent-gold"
          />
          Post to Instagram
        </label>
        <Input
          label="Instagram Business Account ID"
          value={values.instagramBusinessAccountId}
          onChange={(event) =>
            update("instagramBusinessAccountId", event.target.value)
          }
        />
        <p className="font-body text-xs text-muted">
          Instagram publishing uses the same Facebook access token above — it
          just needs to be linked to this Instagram Business Account.
        </p>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            isLoading={igTesting}
            onClick={handleTestInstagram}
          >
            Test Connection
          </Button>
        </div>
        {igTestMessage && (
          <AuthMessage variant={igTestMessage.variant} message={igTestMessage.text} />
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-beige pt-4">
        <p className="font-body text-sm font-medium text-primary">
          Facebook & Instagram Shop product tagging
        </p>
        <p className="font-body text-xs text-muted">
          Tags each post to the matching product in a Meta product catalog,
          so it shows a tappable &quot;Shop now&quot; product tag. Paste this
          feed URL into Meta Commerce Manager as a scheduled feed, then fill
          in the Catalog ID and Feed ID it gives you.
        </p>
        <Input label="Product Feed URL" value={feedUrl} readOnly />
        <Input
          label="Facebook Catalog ID"
          value={values.facebookCatalogId}
          onChange={(event) => update("facebookCatalogId", event.target.value)}
        />
        <Input
          label="Product Feed ID"
          value={values.facebookProductFeedId}
          onChange={(event) =>
            update("facebookProductFeedId", event.target.value)
          }
        />
        <label className="flex items-center gap-2 font-body text-sm text-primary">
          <input
            type="checkbox"
            checked={values.productTaggingEnabled}
            onChange={(event) =>
              update("productTaggingEnabled", event.target.checked)
            }
            className="h-4 w-4 accent-gold"
          />
          Enable product tagging
        </label>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            isLoading={feedSyncing}
            onClick={handleSyncFeed}
          >
            Sync Feed Now
          </Button>
        </div>
        {feedSyncMessage && (
          <AuthMessage
            variant={feedSyncMessage.variant}
            message={feedSyncMessage.text}
          />
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-fit"
        isLoading={isSubmitting}
      >
        Save Settings
      </Button>
    </form>
  );
}
