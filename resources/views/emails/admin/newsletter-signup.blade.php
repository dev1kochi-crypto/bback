<!doctype html>
<html>
<body style="font-family: Arial, sans-serif; color: #111; line-height: 1.5;">
    <h2>New Newsletter Signup</h2>
    <p>A new visitor subscribed to the newsletter.</p>
    <table cellpadding="8" cellspacing="0" border="0" style="border-collapse: collapse;">
        <tr>
            <td><strong>Email</strong></td>
            <td>{{ $signup->email }}</td>
        </tr>
        <tr>
            <td><strong>Subscribed At</strong></td>
            <td>{{ optional($signup->created_at)->format('d M Y H:i') }}</td>
        </tr>
    </table>
</body>
</html>
