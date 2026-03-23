<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subject ?? 'UpgraderCX Notification' }}</title>
</head>
<body style="margin:0; padding:0; background:#eef2f1; font-family: 'Segoe UI', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td align="center">
                <!-- Main Card -->
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:620px; background:#ffffff; margin:30px auto; border-radius:14px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background:linear-gradient(135deg,#1f4d39,#2e7d5b); padding:35px; text-align:center; color:#ffffff;">
                            <h1 style="margin:0; font-size:26px;">UpgraderCX</h1>
                            <p style="margin:8px 0 0; opacity:0.9;">Premium Subscriptions — Up to 80% OFF</p>
                        </td>
                    </tr>

                    <!-- Content Area -->
                    <tr>
                        <td style="padding:40px 30px;">
                            @yield('content')
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding:25px; text-align:center; font-size:13px; color:#888; background:#fcfcfc; border-top:1px solid #eee;">
                            <p style="margin:0;">© {{ date('Y') }} UpgraderCX. All rights reserved.</p>
                            <p style="margin:8px 0;">
                                <a href="https://upgradercx.com/support" style="color:#1f4d39; text-decoration:none;">Support</a> • 
                                <a href="https://upgradercx.com/terms" style="color:#1f4d39; text-decoration:none;">Terms of Service</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
