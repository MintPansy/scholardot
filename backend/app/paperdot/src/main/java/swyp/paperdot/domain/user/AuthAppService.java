package swyp.paperdot.domain.user;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthAppService {

    private final RefreshTokenService refreshTokenService;
    private final SocialAccountRepository socialAccountRepository;
    private final UserRepository userRepository;
    private final KakaoAdminClient kakaoAdminClient;

    // 공통 로그아웃
    @Transactional
    public void logout(Long userId) {
        refreshTokenService.revokeAllByUser(userId);

        socialAccountRepository.findByUser_IdAndProvider(userId, SocialProvider.KAKAO)
                .ifPresent(sa -> kakaoAdminClient.logoutByProviderUserId(sa.getProviderUserId()));
    }

    // 카카오 회원탈퇴(연결끊기 + DB 삭제)
    @Transactional
    public void withdrawKakao(Long userId) {
        socialAccountRepository.findByUser_IdAndProvider(userId, SocialProvider.KAKAO)
                .ifPresent(sa -> kakaoAdminClient.unlinkByProviderUserId(sa.getProviderUserId()));

        deleteLocalUserData(userId);
    }

    private void deleteLocalUserData(Long userId) {
        refreshTokenService.revokeAllByUser(userId);
        socialAccountRepository.deleteByUser_Id(userId);
        userRepository.deleteById(userId);
    }
}

