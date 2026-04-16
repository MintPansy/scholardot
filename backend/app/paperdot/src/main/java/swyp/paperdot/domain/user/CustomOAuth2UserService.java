package swyp.paperdot.domain.user;

import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

  private final UserService userService;

  @Override
  public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
    OAuth2User oAuth2User = super.loadUser(userRequest);

    String registrationId = userRequest.getClientRegistration().getRegistrationId();

    if ("kakao".equals(registrationId)) {
      return handleKakao(oAuth2User);
    }
    return oAuth2User;
  }

  private OAuth2User handleKakao(OAuth2User oAuth2User) {
    Map<String, Object> attributes = oAuth2User.getAttributes();

    String providerUserId = String.valueOf(attributes.get("id"));

    Map<String, Object> account = (Map<String, Object>) attributes.get("kakao_account");
    String email = null;
    String nickname = null;
    String profileImageUrl = null;

    if (account != null) {
      Object emailObj = account.get("email");
      if (emailObj != null)
        email = String.valueOf(emailObj);

      Map<String, Object> profile = (Map<String, Object>) account.get("profile");
      if (profile != null) {
        Object nickObj = profile.get("nickname");
        if (nickObj != null)
          nickname = String.valueOf(nickObj);

        Object imgObj = profile.get("profile_image_url");
        if (imgObj != null)
          profileImageUrl = String.valueOf(imgObj);
      }
    }

    UserEntity user = userService.upsertSocialUser(
        SocialProvider.KAKAO, providerUserId, email, nickname, profileImageUrl);

    return new DefaultOAuth2User(
        Set.of(() -> "ROLE_USER"),
        Map.of("userId", user.getId(), "provider", "KAKAO"),
        "userId");
  }
}
