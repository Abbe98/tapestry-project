{ pkgs, lib, config, ... }:

{
  packages = with pkgs; [
    git
    # Worker runtime dependencies (see Dockerfile.server worker stage)
    chromium
    ffmpeg
    imagemagick
    ghostscript
  ];

  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_24;
    npm.enable = true;
  };

  languages.typescript.enable = true;

  env = {
    PUPPETEER_EXECUTABLE_PATH = "${pkgs.chromium}/bin/chromium";
    PUPPETEER_SKIP_DOWNLOAD = "true";
  };

  services.postgres = {
    enable = true;
    package = pkgs.postgresql_17;
    listen_addresses = "127.0.0.1";
    initialDatabases = [
      { name = "tapestry"; }
    ];
    initialScript = ''
      CREATE USER tapestry WITH SUPERUSER PASSWORD 'tapestry';
    '';
  };

  services.redis = {
    enable = true;
    bind = "127.0.0.1";
    port = 6379;
  };

  enterShell = ''
    echo "tapestry-project devenv"
    echo "  node:       $(node --version)"
    echo "  npm:        $(npm --version)"
    echo "  chromium:   ${pkgs.chromium}/bin/chromium"
    echo ""
    echo "Services (start with: devenv up):"
    echo "  postgres:   127.0.0.1:5432 (db=tapestry user=tapestry pass=tapestry)"
    echo "  redis:      127.0.0.1:6379"
    echo ""
    echo "For S3 (LocalStack) and Vault, use:"
    echo "  npm run localstack:start"
    echo "  npm run vault:start"
  '';

  scripts.install.exec = "npm install";
  scripts.prisma-setup.exec = ''
    set -e
    cd "${config.env.DEVENV_ROOT}/server"
    npm run prisma:generate
    npm run prisma:migrate
  '';
}
