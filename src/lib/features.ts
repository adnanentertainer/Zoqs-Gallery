/**
 * Kill switch for the Social Engagement Reward ("Earn Your Discount")
 * campaign feature.
 *
 * The business requirement was automatic confirmation that a customer
 * actually liked/shared a set number of Facebook/Instagram posts. Meta's
 * official APIs do not expose that (no permission lets a third-party app
 * see which individual users engaged with a post, and Meta's Platform
 * Policy separately prohibits rewarding likes/shares). What was built
 * instead relies on customers self-declaring engagement via checkboxes,
 * which does not meet the actual requirement — so the feature is disabled
 * here rather than deleted, pending a decision on how to proceed.
 *
 * Every entry point (admin pages/actions, customer page/actions, and both
 * nav links) checks this flag and refuses to run/render while it is false.
 */
export const SOCIAL_ENGAGEMENT_CAMPAIGNS_ENABLED = false;
