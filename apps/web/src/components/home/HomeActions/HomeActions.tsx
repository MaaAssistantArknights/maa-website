import { Icon } from '@iconify/react';
import { FC } from 'react';
import { GlowButton } from '../../foundations/GlowButton/GlowButton';
import mdiWindows from '@iconify/icons-mdi/windows';
import mdiGitHub from '@iconify/icons-mdi/github';

const platforms = [
  {
    icon: mdiWindows,
    title: 'Windows',
    url: 'https://github.com/MaaAssistantArknights/MaaAssistantArknights/',
    version: 'v3.9.9 (2022.6.5 18:32)',
  },
];

export const HomeActions: FC = () => {
  return (
    <div className="absolute bottom-0 left-0 right-0 mb-24 md:mb-[7vh] flex flex-col mx-8">
      <div className="flex-col items-center justify-center hidden gap-2 font-light md:flex md:flex-row md:gap-6">
        {platforms.map((platform) => (
          <GlowButton>
            <div className="flex flex-col items-start">
              <div className="flex items-center -ml-1">
                <Icon icon={platform.icon} fontSize="28px" />
                <span className="ml-2">{platform.title}</span>
              </div>
              <div className="flex mt-1 mb-0.5 ml-8">
                <span className="text-xs">{platform.version}</span>
              </div>
            </div>
          </GlowButton>
        ))}
      </div>

      <div className="flex flex-row items-center justify-center md:hidden">
        <GlowButton>
          <div className="flex items-center -ml-1 text-sm">
            <Icon icon={mdiGitHub} fontSize="20px" />
            <span className="ml-2">GitHub</span>
          </div>
        </GlowButton>
      </div>

      <div className="mt-6 text-xs leading-5 text-center md:mt-8 text-white/70">
        MAA 以 AGPL-3.0 协议开源；使用即表示您同意并知悉「用户协议」的相关内容。
      </div>

      <div className="flex-row items-center justify-center hidden mt-4 md:flex">
        <GlowButton translucent href="https://github.com/MaaAssistantArknights">
          <div className="flex items-center -ml-1 text-sm">
            <Icon icon={mdiGitHub} fontSize="20px" />
            <span className="ml-2">GitHub</span>
          </div>
        </GlowButton>
      </div>
    </div>
  );
};
