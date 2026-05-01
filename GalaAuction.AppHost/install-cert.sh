sudo security import rivendell-cert.pfx -k /Library/Keychains/System.keychain -P "rivendell-dev-password" -T /Applications/Google\ Chrome.app -T /Applications/Safari.app
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain rivendell-cert.pfx
