FROM php:8.3-cli-alpine AS build

RUN apk add --no-cache \
    git \
    unzip \
    libpq-dev \
    icu-dev \
    oniguruma-dev \
    libzip-dev \
    postgresql-client >/tmp/apk-build.log \
 && docker-php-ext-install \
    bcmath \
    intl \
    pcntl \
    pdo_pgsql \
    zip >/tmp/php-ext-install.log

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY apps/api/composer.json apps/api/composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --no-scripts --quiet

COPY apps/api ./

RUN composer dump-autoload --optimize --no-dev --classmap-authoritative --quiet
RUN php artisan package:discover --ansi >/tmp/package-discover.log

FROM php:8.3-cli-alpine AS runtime

RUN apk add --no-cache \
    bash \
    libpq \
    icu-libs \
    libzip \
    oniguruma \
    postgresql-client

RUN addgroup -g 1000 app && adduser -D -G app -u 1000 app

WORKDIR /var/www/html

COPY --from=build /usr/local/lib/php/extensions /usr/local/lib/php/extensions
COPY --from=build /usr/local/etc/php/conf.d /usr/local/etc/php/conf.d
COPY --from=build /usr/bin/composer /usr/bin/composer
COPY --from=build /var/www/html ./
COPY apps/api/docker/entrypoint.sh /usr/local/bin/nest-api-entrypoint

RUN chmod +x /usr/local/bin/nest-api-entrypoint \
 && mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
 && chown -R app:app /var/www/html

USER app

ENV APP_ENV=production
ENV APP_DEBUG=false
ENV PORT=9000

EXPOSE 9000

ENTRYPOINT ["nest-api-entrypoint"]
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=9000"]
