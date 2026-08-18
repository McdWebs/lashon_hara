import { Box, Link, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useLocale } from "../i18n/useLocale";
import type { StoreCategoryTile } from "../lib/storeUi";

const displayFont = '"Secular One", Heebo, sans-serif';

const tileLinkSx = {
  color: "inherit",
  display: "block",
  height: "100%",
  textDecoration: "none",
  "&:hover .category-tile-img": { transform: "scale(1.04)" },
  "&:hover .category-tile-hover-img": { opacity: 1 },
} as const;

function TileImage({
  tile,
  alt,
  rounded,
}: {
  tile: StoreCategoryTile;
  alt: string;
  rounded?: number;
}) {
  return (
    <>
      <Box
        className="category-tile-img"
        component="img"
        src={tile.image}
        alt={alt}
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: tile.objectPosition ?? "center",
          display: "block",
          borderRadius: rounded,
          transition: "transform .65s cubic-bezier(.2,.7,.2,1)",
        }}
      />
      {tile.hoverImage && (
        <Box
          className="category-tile-hover-img"
          component="img"
          src={tile.hoverImage}
          alt=""
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: tile.objectPosition ?? "center",
            borderRadius: rounded,
            opacity: 0,
            transition: "opacity .4s ease",
          }}
        />
      )}
    </>
  );
}

function OverlayTile({ tile, to }: { tile: StoreCategoryTile; to: string }) {
  const { lang } = useLocale();

  return (
    <Link component={RouterLink} to={to} underline="none" sx={tileLinkSx}>
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          height: "100%",
          bgcolor: "#e8e2d8",
        }}
      >
        <TileImage tile={tile} alt={tile.label[lang]} />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(8,8,8,0) 40%, rgba(8,8,8,.8) 100%)",
            pointerEvents: "none",
          }}
        />
        <Box sx={{ position: "absolute", insetInline: 12, bottom: 12, color: "#fff" }}>
          <Typography sx={{ fontFamily: displayFont, fontSize: { xs: 20, md: 22 }, lineHeight: 1.05 }}>
            {tile.label[lang]}
          </Typography>
          <Typography
            sx={{
              mt: 0.35,
              fontSize: 11,
              color: "rgba(255,255,255,.75)",
              display: { xs: "none", sm: "-webkit-box" },
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {tile.note[lang]}
          </Typography>
        </Box>
      </Box>
    </Link>
  );
}

function HeroTile({ tile, to }: { tile: StoreCategoryTile; to: string }) {
  const { lang } = useLocale();

  return (
    <Link component={RouterLink} to={to} underline="none" sx={tileLinkSx}>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            flex: 1,
            minHeight: 0,
            bgcolor: "#ece6dc",
          }}
        >
          <TileImage tile={tile} alt={tile.label[lang]} />
        </Box>
        <Box
          sx={{
            px: 1.25,
            py: 1,
            borderTop: `2px solid ${tile.accent}`,
            bgcolor: "#fffdf8",
          }}
        >
          <Typography sx={{ fontFamily: displayFont, fontSize: { xs: 17, md: 18 }, lineHeight: 1.05 }}>
            {tile.label[lang]}
          </Typography>
          <Typography
            sx={{
              mt: 0.35,
              fontSize: 10,
              color: "rgba(17,17,17,.5)",
              lineHeight: 1.3,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {tile.note[lang]}
          </Typography>
        </Box>
      </Box>
    </Link>
  );
}

function InsetTile({ tile, to }: { tile: StoreCategoryTile; to: string }) {
  const { lang } = useLocale();

  return (
    <Link component={RouterLink} to={to} underline="none" sx={tileLinkSx}>
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f3efe8",
          p: { xs: 1.25, md: 1.5 },
          gap: { xs: 1, md: 1.15 },
        }}
      >
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "50%",
            width: { xs: "72%", md: "82%" },
            maxWidth: 150,
            aspectRatio: "1",
            flexShrink: 0,
            bgcolor: "#fff",
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,.06)",
          }}
        >
          <TileImage tile={tile} alt={tile.label[lang]} rounded={9999} />
        </Box>
        <Box sx={{ textAlign: "center", minWidth: 0, width: "100%" }}>
          <Typography sx={{ fontFamily: displayFont, fontSize: { xs: 17, md: 18 }, lineHeight: 1.1 }}>
            {tile.label[lang]}
          </Typography>
          <Typography
            sx={{
              mt: 0.35,
              fontSize: 10,
              color: "rgba(17,17,17,.55)",
              lineHeight: 1.35,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {tile.note[lang]}
          </Typography>
        </Box>
      </Box>
    </Link>
  );
}

function BandTile({ tile, to }: { tile: StoreCategoryTile; to: string }) {
  const { lang } = useLocale();

  return (
    <Link component={RouterLink} to={to} underline="none" sx={tileLinkSx}>
      <Box
        sx={{
          height: "100%",
          display: "grid",
          gridTemplateRows: "1fr auto",
          overflow: "hidden",
        }}
      >
        <Box sx={{ position: "relative", overflow: "hidden", minHeight: 0, bgcolor: "#e5e0d6" }}>
          <TileImage tile={tile} alt={tile.label[lang]} />
        </Box>
        <Box
          sx={{
            bgcolor: tile.accent,
            color: "#fff",
            px: 1.25,
            py: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography sx={{ fontFamily: displayFont, fontSize: { xs: 17, md: 18 }, lineHeight: 1.05 }}>
            {tile.label[lang]}
          </Typography>
        </Box>
      </Box>
    </Link>
  );
}

export function StoreCategoryTileCard({ tile }: { tile: StoreCategoryTile }) {
  const { loc } = useLocale();
  const to = loc(`/shop?category=${tile.category}`);

  switch (tile.variant) {
    case "overlay":
      return <OverlayTile tile={tile} to={to} />;
    case "hero":
      return <HeroTile tile={tile} to={to} />;
    case "inset":
      return <InsetTile tile={tile} to={to} />;
    case "band":
      return <BandTile tile={tile} to={to} />;
  }
}
