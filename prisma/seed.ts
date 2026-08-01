import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@tisora.vn" },
    update: { name: "Admin Tisora", passwordHash },
    create: {
      email: "admin@tisora.vn",
      name: "Admin Tisora",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  // Giữ admin cũ nếu đã seed trước đó
  await prisma.user.upsert({
    where: { email: "admin@lunara.vn" },
    update: { role: Role.ADMIN, passwordHash },
    create: {
      email: "admin@lunara.vn",
      name: "Admin Tisora",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: "khach@tisora.vn" },
    update: {},
    create: {
      email: "khach@tisora.vn",
      name: "Khách Demo",
      phone: "0901234567",
      passwordHash: await bcrypt.hash("khach123", 10),
      role: Role.CUSTOMER,
    },
  });

  const categories = [
    { name: "Đầm", slug: "dam", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80", sortOrder: 1 },
    { name: "Vest - Blazer", slug: "vest-blazer", image: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=600&q=80", sortOrder: 2 },
    { name: "Đồ thể thao", slug: "do-the-thao", image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&q=80", sortOrder: 3 },
    { name: "Đồ bơi", slug: "do-boi", image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80", sortOrder: 4 },
    { name: "Đồ ngủ", slug: "do-ngu", image: "https://images.unsplash.com/photo-1617331721458-bd3bd3f9c619?w=600&q=80", sortOrder: 5 },
    { name: "Áo sơ mi", slug: "ao-so-mi", image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80", sortOrder: 6 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }

  const dam = await prisma.category.findUniqueOrThrow({ where: { slug: "dam" } });
  const somi = await prisma.category.findUniqueOrThrow({ where: { slug: "ao-so-mi" } });

  const products = [
    {
      name: "Đầm voan tầng Ruby",
      slug: "dam-voan-tang-ruby",
      brand: "Tisora",
      description:
        "Đầm dập ly cổ V vạt trước đáp chéo, tay sát nách. Eo chiết. Tùng váy dài qua mắt cá chân được xếp tầng tạo xòe. Xẻ gấu dài 1 bên tạo điểm thu hút. Cài khóa kéo ẩn sau lưng.\n\nBên ngoài bằng lớp vải voan được dập ly cố định, bên trong có lót lụa đồng màu.\n\nMàu sắc: Đỏ Ruby - Xanh Atlantic\n\nThông số người mẫu (size XS):\n- Chiều cao: 167cm\n- Vòng eo: 61 cm\n- Vòng hông: 88cm\n- Vòng ngực: 78cm\n\nChất liệu & bảo quản:\n- Vải dệt kim: sau khi giặt sản phẩm phải được phơi ngang tránh bai dãn.",
      images: [
        "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=900&q=80",
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=900&q=80",
        "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=900&q=80",
        "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=900&q=80",
        "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900&q=80",
      ],
      featured: true,
      categoryId: dam.id,
      variants: [
        { color: "Đỏ", size: "S", price: 3890000, compareAt: 7780000, stock: 8, sku: "VA89665-DO-S" },
        { color: "Đỏ", size: "M", price: 3890000, compareAt: 7780000, stock: 10, sku: "VA89665-DO-M" },
        { color: "Đỏ", size: "L", price: 3890000, compareAt: 7780000, stock: 6, sku: "VA89665-DO-L" },
        { color: "Xanh rêu", size: "S", price: 3890000, compareAt: 7780000, stock: 5, sku: "VA89665-XR-S" },
        { color: "Xanh rêu", size: "M", price: 3890000, compareAt: 7780000, stock: 7, sku: "VA89665-XR-M" },
        { color: "Xanh rêu", size: "L", price: 3890000, compareAt: 7780000, stock: 4, sku: "VA89665-XR-L" },
      ],
    },
    {
      name: "Váy Arta Satin",
      slug: "vay-arta-satin",
      brand: "Tisora",
      description: "Váy satin ôm dáng, phù hợp đi tiệc và event. Chất liệu mềm, rũ nhẹ.",
      images: [
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
        "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80",
      ],
      featured: true,
      categoryId: dam.id,
      variants: [
        { color: "Nude", size: "S", price: 4360000, compareAt: 8720000, stock: 8, sku: "ARTA-NUDE-S" },
        { color: "Nude", size: "M", price: 4360000, compareAt: 8720000, stock: 12, sku: "ARTA-NUDE-M" },
        { color: "Đen", size: "S", price: 4360000, compareAt: 8720000, stock: 5, sku: "ARTA-DEN-S" },
        { color: "Đen", size: "M", price: 4360000, compareAt: 8720000, stock: 10, sku: "ARTA-DEN-M" },
      ],
    },
    {
      name: "Váy Billy Knit",
      slug: "vay-billy-knit",
      brand: "Tisora",
      description: "Váy len dệt kim co giãn nhẹ, form body tôn dáng.",
      images: ["https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80"],
      featured: true,
      categoryId: dam.id,
      variants: [
        { color: "Cam", size: "M", price: 2360000, compareAt: 4720000, stock: 15, sku: "BILLY-CAM-M" },
        { color: "Xanh", size: "M", price: 2360000, compareAt: 4720000, stock: 9, sku: "BILLY-XANH-M" },
      ],
    },
    {
      name: "Váy kiểu Dasha",
      slug: "vay-kieu-dasha",
      brand: "Tisora",
      description: "Thiết kế cổ điển với chi tiết xếp ly tinh tế.",
      images: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80"],
      featured: true,
      categoryId: dam.id,
      variants: [
        { color: "Đen", size: "S", price: 2830000, compareAt: 5660000, stock: 7, sku: "DASHA-DEN-S" },
        { color: "Đen", size: "M", price: 2830000, compareAt: 5660000, stock: 11, sku: "DASHA-DEN-M" },
      ],
    },
    {
      name: "Đầm dạ hội Raya",
      slug: "dam-da-hoi-raya",
      brand: "Tisora",
      description: "Đầm dạ hội cắt xẻ tinh tế, phù hợp sự kiện sang trọng.",
      images: ["https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80"],
      featured: true,
      categoryId: dam.id,
      variants: [
        { color: "Đỏ", size: "M", price: 5430000, compareAt: 10860000, stock: 4, sku: "RAYA-DO-M" },
        { color: "Cam", size: "M", price: 5430000, compareAt: 10860000, stock: 3, sku: "RAYA-CAM-M" },
      ],
    },
    {
      name: "Đầm cổ vuông Laura",
      slug: "dam-co-vuong-laura",
      brand: "Tisora",
      description: "Đầm cổ vuông nữ tính, dễ phối phụ kiện.",
      images: ["https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80"],
      featured: true,
      categoryId: dam.id,
      variants: [
        { color: "Cam", size: "S", price: 3240000, compareAt: 6480000, stock: 6, sku: "LAURA-CAM-S" },
        { color: "Hồng", size: "M", price: 3240000, compareAt: 6480000, stock: 8, sku: "LAURA-HONG-M" },
      ],
    },
    {
      name: "Áo sơ mi Will Oversize",
      slug: "ao-so-mi-will-oversize",
      brand: "Tisora",
      description: "Sơ mi oversize form rộng, chất cotton mềm mát.",
      images: ["https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80"],
      featured: false,
      categoryId: somi.id,
      variants: [
        { color: "Xanh", size: "M", price: 1160000, compareAt: 1850000, stock: 20, sku: "WILL-XANH-M" },
        { color: "Nude", size: "L", price: 1160000, compareAt: 1850000, stock: 14, sku: "WILL-NUDE-L" },
      ],
    },
  ];

  for (const p of products) {
    const { variants, ...data } = p;
    const product = await prisma.product.upsert({
      where: { slug: data.slug },
      update: {
        name: data.name,
        brand: data.brand,
        description: data.description,
        images: data.images,
        featured: data.featured,
        categoryId: data.categoryId,
        published: true,
      },
      create: { ...data, published: true },
    });

    await prisma.productVariant.deleteMany({ where: { productId: product.id } });
    await prisma.productVariant.createMany({
      data: variants.map((v) => ({
        ...v,
        productId: product.id,
        title: `${v.color} / ${v.size}`,
      })),
    });
  }

  const coupons = [
    {
      code: "TISORA10",
      description: "Mã giảm 10% cho đơn hàng tối thiểu 2 triệu",
      percentOff: 10,
      minOrder: 2000000,
      maxDiscount: 500000,
    },
    {
      code: "TISORA15",
      description: "Mã giảm 15% cho đơn hàng tối thiểu 5 triệu",
      percentOff: 15,
      minOrder: 5000000,
      maxDiscount: 2000000,
    },
    {
      code: "TISORA",
      description: "Thêm 5% cho mọi đơn hàng",
      percentOff: 5,
      minOrder: 0,
      maxDiscount: 300000,
    },
    {
      code: "FREESHIP",
      description: "Miễn phí ship cho đơn hàng tối thiểu 1 triệu",
      freeShip: true,
      minOrder: 1000000,
    },
  ];

  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: c,
      create: { ...c, freeShip: c.freeShip ?? false },
    });
  }

  const now = new Date();
  const ends = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  await prisma.flashSale.deleteMany();
  await prisma.flashSale.create({
    data: {
      title: "GIẢM SỐC 50%",
      percentOff: 50,
      startsAt: now,
      endsAt: ends,
      active: true,
      tabLabels: ["Hàng hiệu -50%", "Năng động ngày hè", "Chào biển nắng mới"],
    },
  });

  await prisma.banner.deleteMany();
  await prisma.banner.createMany({
    data: [
      {
        title: "Bộ sưu tập Xuân Hè",
        image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=80",
        href: "/collections/dam",
        sortOrder: 1,
      },
      {
        title: "Flash Sale 50%",
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80",
        href: "/#flash-sale",
        sortOrder: 2,
      },
    ],
  });

  await prisma.lookbook.deleteMany();
  await prisma.lookbook.createMany({
    data: [
      {
        title: "Set đồ tập Yoga Xuân Hè",
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
        href: "/collections/do-the-thao",
        sortOrder: 1,
      },
      {
        title: "Set đồ tập Gym Xuân Hè",
        image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800&q=80",
        href: "/collections/do-the-thao",
        sortOrder: 2,
      },
      {
        title: "Set đồ Bikini hè",
        image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
        href: "/collections/do-boi",
        sortOrder: 3,
      },
    ],
  });

  await prisma.review.deleteMany();
  await prisma.review.createMany({
    data: [
      {
        name: "Liên Hoa",
        content:
          "Sản phẩm chất lượng, chất vải mềm mát mặc vào rất thoải mái và ôm sát người, giá cả hợp lý.",
        avatar: "https://i.pravatar.cc/100?img=1",
        sortOrder: 1,
      },
      {
        name: "Bích Chi",
        content:
          "Sản phẩm đẹp, chất liệu mát, mặc vừa người, nhân viên phục vụ rất tận tình và chu đáo.",
        avatar: "https://i.pravatar.cc/100?img=5",
        sortOrder: 2,
      },
      {
        name: "Thu Hằng",
        content: "Giao hàng nhanh, váy xuất sắc, mặc đẹp lắm, sẽ ủng hộ shop dài dài!",
        avatar: "https://i.pravatar.cc/100?img=9",
        sortOrder: 3,
      },
      {
        name: "Xuân Hoài",
        content:
          "Tôi rất hài lòng về sản phẩm dịch vụ. Sản phẩm tốt ngoài mong đợi, giao hàng rất nhanh.",
        avatar: "https://i.pravatar.cc/100?img=16",
        sortOrder: 4,
      },
    ],
  });

  const posts = [
    {
      title: "4 Xu hướng trang phục hè gây sốt cho phái đẹp",
      slug: "4-xu-huong-trang-phuc-he",
      excerpt: "Thời tiết nóng bức đòi hỏi chúng ta cập nhật tủ quần áo với những thiết kế và chất liệu mới.",
      content:
        "Mùa hè là lúc linen, croptop và váy maxi lên ngôi. Hãy ưu tiên chất liệu thoáng mát và màu sắc tươi sáng.",
      coverImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
    },
    {
      title: "Bí kíp mix & match outfit mùa hè chuẩn streetstyle",
      slug: "bi-kip-mix-match-mua-he",
      excerpt: "Những công thức phối đồ đơn giản giúp bạn nổi bật mỗi ngày.",
      content:
        "Công thức cơ bản: áo oversize + chân váy ngắn, hoặc sơ mi linen + quần ống rộng.",
      coverImage: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80",
    },
    {
      title: "Nghệ thuật tiết kiệm từ những tín đồ sống tối giản",
      slug: "nghe-thuat-tiet-kiem-toi-gian",
      excerpt: "Mẹo quản lý tài chính chặt chẽ nhưng vẫn cảm thấy cuộc sống nhẹ nhàng.",
      content: "Mua ít nhưng chọn kỹ, ưu tiên chất liệu bền và form dáng linh hoạt.",
      coverImage: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80",
    },
    {
      title: "Xu hướng đầm dự tiệc mùa hè",
      slug: "xu-huong-dam-du-tiec-mua-he",
      excerpt: "Những thiết kế xẻ cao, voan tầng đang được ưa chuộng.",
      content: "Đầm voan tầng và cut-out là điểm nhấn cho mọi buổi tiệc.",
      coverImage: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80",
    },
  ];

  for (const post of posts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: post,
      create: post,
    });
  }

  console.log("Seed OK — brand Tisora. Admin:", admin.email, "/ admin123");
  console.log("PDP demo: /products/dam-voan-tang-ruby");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
