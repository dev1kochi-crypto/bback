<!doctype html>
<html>
<body style="font-family: Arial, sans-serif; color: #111; line-height: 1.5;">
    <h2>New Contact Enquiry</h2>
    <p>A visitor submitted the contact form.</p>
    <table cellpadding="8" cellspacing="0" border="0" style="border-collapse: collapse;">
        <tr>
            <td><strong>Name</strong></td>
            <td>{{ $enquiry->name }}</td>
        </tr>
        <tr>
            <td><strong>Email</strong></td>
            <td>{{ $enquiry->email }}</td>
        </tr>
        <tr>
            <td><strong>Phone</strong></td>
            <td>{{ $enquiry->phone ?: '-' }}</td>
        </tr>
        <tr>
            <td><strong>Message</strong></td>
            <td>{{ $enquiry->message }}</td>
        </tr>
        <tr>
            <td><strong>Page URL</strong></td>
            <td>{{ $enquiry->page_url ?: '-' }}</td>
        </tr>
        <tr>
            <td><strong>Submitted At</strong></td>
            <td>{{ optional($enquiry->created_at)->format('d M Y H:i') }}</td>
        </tr>
    </table>
</body>
</html>
