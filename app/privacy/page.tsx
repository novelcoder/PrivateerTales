import type { Metadata } from 'next';

import { CookieSettingsButton } from '@/components/analytics-consent';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import type { SeriesRecord } from '@/lib/appwrite';

const privacySeries = {
  id: 'privateer-tales',
  name: 'Privateer Tales',
  slug: 'privateer-tales',
  tagline: 'Bold crews. Distant worlds. Endless adventure.',
  description:
    'Bold crews, distant worlds, and twenty space-opera adventures by Jamie McFarlane.',
} satisfies SeriesRecord;

export const metadata: Metadata = {
  title: 'Privacy & Cookies | Privateer Tales',
  description:
    'How the Privateer Tales website handles optional analytics and cookies.',
};

export default function PrivacyPage() {
  return (
    <main>
      <SiteHeader series={privacySeries} />

      <article className="privacy-page">
        <div className="privacy-shell">
          <p className="eyebrow">Site information</p>
          <h1>Privacy &amp; cookies</h1>
          <p className="privacy-updated">Last updated September 15, 2026</p>

          <div className="privacy-content">
            <section>
              <h2>The short version</h2>
              <p>
                Privateer Tales uses optional Google Analytics only when it is
                enabled for this site and you choose{' '}
                <strong>Allow analytics</strong>. Declining does not change how
                the site works. We do not use advertising or marketing cookies.
              </p>
            </section>

            <section>
              <h2>Cookies used by this site</h2>
              <div className="cookie-table-wrap">
                <table className="cookie-table">
                  <thead>
                    <tr>
                      <th>Cookie</th>
                      <th>Purpose</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <code>pt_analytics_consent</code>
                      </td>
                      <td>
                        Remembers whether you allowed or declined optional
                        analytics. This preference cookie is necessary to
                        respect your choice.
                      </td>
                      <td>Six months</td>
                    </tr>
                    <tr>
                      <td>
                        <code>_ga</code>
                      </td>
                      <td>
                        Google Analytics distinguishes visitors for aggregate
                        site statistics. It is set only after you allow
                        analytics.
                      </td>
                      <td>Up to two years</td>
                    </tr>
                    <tr>
                      <td>
                        <code>_ga_&lt;measurement-id&gt;</code>
                      </td>
                      <td>
                        Google Analytics preserves session state. It is set only
                        after you allow analytics.
                      </td>
                      <td>Up to two years</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2>What analytics receives</h2>
              <p>
                When allowed, Google Analytics may receive information such as
                the page visited, visit time, referring page, approximate
                location, and browser or device information. We configure it
                with Google Signals and advertising personalization disabled,
                and we do not intentionally send names, email addresses, or
                other direct identifiers.
              </p>
              <p>
                Google explains its handling of Analytics data in{' '}
                <a
                  href="https://support.google.com/analytics/answer/6004245"
                  rel="noreferrer"
                >
                  Safeguarding your data
                </a>
                .
              </p>
            </section>

            <section>
              <h2>Change your choice</h2>
              <p>
                You can reopen the cookie choices at any time. If you withdraw
                consent, this site disables Analytics and removes its
                first-party Analytics cookies from this site where the browser
                permits it.
              </p>
              <CookieSettingsButton
                className="cookie-settings-inline"
                label="Review cookie settings"
              />
            </section>

            <section>
              <h2>Hosting and external links</h2>
              <p>
                Our hosting and network providers may process technical request
                information, such as an IP address and browser details, to
                deliver and secure the site. When you follow a link to another
                website, that website applies its own privacy practices.
              </p>
            </section>
          </div>
        </div>
      </article>

      <SiteFooter series={privacySeries} />
    </main>
  );
}
