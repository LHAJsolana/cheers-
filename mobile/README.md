# Cheers Mobile

Expo SDK 54 / React Native mobile client for the Cheers MVP. This version is intended for the current Expo Go app on iOS and Android.

The mobile app does not use Prisma and does not own the database. It calls the existing Next.js backend API under `/api/mobile`.

## 1. Run The Backend

From the project root:

```powershell
npm install
copy .env.example .env
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev
```

Use a Postgres `DATABASE_URL` in the backend `.env`. For same-Wi-Fi Expo Go testing, the backend should show both a local and network URL, for example:

```text
Local:   http://localhost:3000
Network: http://192.168.1.23:3000
```

Use the `Network` IP for the phone. Do not use `localhost` in Expo Go because that points to the phone itself.

If Next does not show a usable network URL, find your IP:

```powershell
ipconfig
```

Look for your Wi-Fi adapter `IPv4 Address`, for example `192.168.1.23`.

## 2. Configure Mobile API URL

From `mobile/`:

```powershell
copy .env.example .env
```

Edit `mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.23:3000/api/mobile
```

Restart Expo after changing `.env`.

For a deployed backend:

```env
EXPO_PUBLIC_API_URL=https://your-vercel-app.vercel.app/api/mobile
```

Use the deployed URL for remote testers so they do not need to be on your Wi-Fi.

## 3. Run With Expo Go

```powershell
cd mobile
npm install
npm run start
```

Scan the QR code with Expo Go on iPhone or Android.

Your phone and computer should be on the same Wi-Fi network. If LAN mode is blocked, try:

```powershell
npm run start:online -- --tunnel
```

The default start script uses Expo offline mode so local testing still works when Expo CLI cannot reach external Expo services from your network. To use Expo's online services directly, run:

```powershell
npm run start:online
```

## Demo Accounts

After backend seed:

- `taha@cheers.local` / `password123`
- `maya@cheers.local` / `password123`
- `sam@cheers.local` / `password123`

## Real Phone Test Checklist

1. Open Expo Go.
2. Login with `taha@cheers.local`.
3. Confirm Home loads dashboard cards.
4. Log a drink.
5. Confirm Home updates.
6. Open Feed.
7. Tap a reaction.
8. Open Stats.
9. Open Profile and save a small change.
10. Open Friends from Profile.
11. Logout and login again.

## Troubleshooting

### "Could not reach the Cheers backend"

- Make sure backend is running with `npm run dev`.
- Make sure `EXPO_PUBLIC_API_URL` uses your computer LAN IP, not `localhost`.
- Make sure phone and computer are on the same Wi-Fi.
- Allow Node.js/Next.js through Windows Firewall if prompted.
- Try `npm run start -- --tunnel`.
- Restart Expo after editing `.env`.

### Login works in browser but not on phone

The phone cannot reach `localhost` on your laptop. Use:

```env
EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IP:3000/api/mobile
```

### Expo Go cannot connect

- Use the same Wi-Fi network.
- Disable VPN temporarily.
- Try tunnel mode with `npm run start:online -- --tunnel`.
- Make sure Expo Go is current; this app targets Expo SDK 54.
- Restart Expo with cache clear:

```powershell
npm run start -- --clear
```

### API returns 401

- Logout and login again.
- Confirm `mobile/.env` points to the backend you seeded.
- For remote testers, confirm it points to the Vercel URL, not your local IP.
- Confirm backend `SESSION_SECRET` did not change while using an old mobile token.

## Future EAS Build Notes

Install EAS CLI later:

```bash
npm install -g eas-cli
eas login
eas build:configure
```

Before App Store / Google Play builds:

- Replace placeholder bundle identifiers if needed.
- Set production `EXPO_PUBLIC_API_URL`.
- Add real icons and splash assets.
- Test auth, drink logging, feed reactions, and profile editing on physical iOS and Android devices.

## Store Submission Notes

Future submission checklist:

- App icon and screenshots
- Privacy policy URL
- Clear alcohol/responsible-use language
- Age rating questionnaire
- No medical/legal BAC claims
- Production backend with persistent hosted database
