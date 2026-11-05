# Reuse this machine's installed Jekyll/plugins without resolving newer gems.
ENV['JEKYLL_NO_BUNDLER_REQUIRE'] = 'true'
require 'jekyll'
Jekyll::Commands::Build.process({ 'source' => Dir.pwd, 'destination' => '_site' })
