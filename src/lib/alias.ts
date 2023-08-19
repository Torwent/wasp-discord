import "module-alias/register"
import { addAliases } from "module-alias"
addAliases({
	$lib: __dirname,
	$structures: __dirname + "/../structures"
})
