#
#  Be sure to run `pod spec lint libindy.podspec' to ensure this is a
#  valid spec and to remove all comments including this before submitting the spec.
#
#  To learn more about Podspec attributes see http://docs.cocoapods.org/specification.html
#  To see working Podspecs in the CocoaPods repo see https://github.com/CocoaPods/Specs/
#
Pod::Spec.new do |s|
  s.name         = "libindy-objc"
  s.version      = "1.16.0"
  s.summary      = "A short description of libindy."
  s.description  = <<-DESC
  libindy pod
  DESC
  s.homepage = "https://github.com/hyperledger/indy-sdk"
  s.license = { :type => 'Apache 2.0' }
  s.author = { "Clécio Varjão" => "1348549+cvarjao@users.noreply.github.com" }
  s.platform = :ios, "10.0"
  s.ios.deployment_target = "10.0"
  #s.source = { :http => 'file:' + File.expand_path('../../../', __dir__) + '/indy-sdk-v1.16.0/wrappers/ios/libindy-pod/build/cocoapods/libindy-objc.zip' }
  #s.ios.vendored_frameworks = "build/Frameworks/Indy.xcframework"
  s.source = { :http => 'https://cvarjao.jfrog.io/artifactory/default-generic-local/latest/libindy-objc.zip' }
  s.ios.vendored_frameworks = "Frameworks/Indy.xcframework"

  s.module_name = "Indy"
end
