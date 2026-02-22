FROM serversideup/php:8.2-fpm-nginx

USER root

WORKDIR /var/www/html

COPY . .

RUN mkdir -p storage/logs storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache

RUN chmod -R 775 storage bootstrap/cache && \
    chown -R www-data:www-data storage bootstrap/cache

RUN composer install --no-dev --optimize-autoloader --no-interaction

EXPOSE 8080
