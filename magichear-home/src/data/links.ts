/** 主导航链接 */
export interface NavLink {
  text: string;
  href: string;
  external?: boolean;
}

/** 社交链接 */
export interface SocialLink {
  icon: string;
  href: string;
  title: string;
  isEmail?: boolean;
}

export const navigationLinks: NavLink[] = [
  { text: "首页", href: "/" },
  { text: "油猴", href: "https://greasyfork.org/zh-CN", external: true },
  {
    text: "简历",
    href: "https://magichear.github.io/intruduction/",
    external: true,
  },
  {
    text: "学习",
    href: "https://magichear.github.io/study/",
    external: true,
  },
  { text: "四十三", href: "https://magichear.github.io/43/", external: true },
  {
    text: "趣玩",
    href: "https://magichear.github.io/interesting/",
    external: true,
  },
  {
    text: "关于",
    href: "https://magichear.github.io/magichear/",
    external: true,
  },
  { text: "bilibili", href: "https://www.bilibili.com/", external: true },
  { text: "vlab", href: "https://vlab.ustc.edu.cn/", external: true },
  { text: "jwc", href: "https://www.teach.ustc.edu.cn/", external: true },
  { text: "LARS", href: "https://jyjsxx.github.io/", external: true },
  { text: "Mail", href: "https://mail.ustc.edu.cn", external: true },
  { text: "力扣", href: "https://leetcode.com/", external: true },
  { text: "环高分布", href: "https://1zio1.github.io/", external: true },
];

export const socialLinks: SocialLink[] = [
  {
    icon: "icon-github",
    href: "https://github.com/magichear/magichear",
    title: "github",
  },
  {
    icon: "icon-cnblogs",
    href: "https://www.weibo.com/u/6343741774",
    title: "weibo",
  },
  {
    icon: "icon-zhihu",
    href: "https://www.zhihu.com/people/bai-wu-liao-lai-41-82",
    title: "zhihu",
  },
  {
    icon: "icon-email",
    href: "d2dkZWNhZGU0M0BtYWlsLnVzdGMuZWR1LmNu",
    title: "email",
    isEmail: true,
  },
];
