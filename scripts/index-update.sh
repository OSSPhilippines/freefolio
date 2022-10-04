#!/bin/bash

cd ../

shopt -s extglob

cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Freefolio</title>
    <link rel="shortcut icon" href="./clean//img/logo.svg" type="image/x-icon">
    <script src="https://cdn.tailwindcss.com"></script>
</head>

<body class="bg-violet-200 text-violet-800">

    <header class="bg-violet-500">
        <div class="container mx-auto px-5 py-8 flex flex-row justify-between">
            <img class="h-14" src="./images/osslogo-text-white.png" alt="">
            <h1 class="text-violet-900 text-center text-3xl lg:text-5xl font-black">
                Freefolio
            </h1>
        </div>
    </header>

    <main>
        <div class="container mx-auto px-5 py-24 grid md:grid-cols-2 gap-12">
EOF

for d in !(images|scripts)/
do
    declare name=${d%/}
    declare CapitalizedName=${name^}
    cat >> index.html <<EOF

            <a href="${name}" class="relative bottom-0 hover:bottom-2 transition-all">
                <img src="./images/${name}.png" alt="" class="rounded-md shadow">
                <h2 class="text-3xl font-bold mt-2">${CapitalizedName}</h2>
            </a>
EOF
done

cat >> index.html <<'EOF'

            </div>
    </main>

</body>

</html>
EOF